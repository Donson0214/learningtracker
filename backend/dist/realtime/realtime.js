"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRealtimeServer = exports.broadcast = void 0;
const ws_1 = __importStar(require("ws"));
const firebase_1 = require("../config/firebase");
const prisma_1 = require("../prisma");
const clients = new Set();
const shouldCheckRevoked = () => process.env.FIREBASE_CHECK_REVOKED === "true";
const parseTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.slice("Bearer ".length).trim();
    }
    const url = req.url ?? "";
    const queryIndex = url.indexOf("?");
    if (queryIndex === -1) {
        return null;
    }
    const params = new URLSearchParams(url.slice(queryIndex));
    return params.get("token");
};
const ensureUserFromToken = async (token) => {
    const decoded = await firebase_1.firebaseAdmin
        .auth()
        .verifyIdToken(token, shouldCheckRevoked());
    let user = await prisma_1.prisma.user.findUnique({
        where: { firebaseUid: decoded.uid },
    });
    if (!user) {
        const email = decoded.email;
        if (!email) {
            throw new Error("User not found");
        }
        const existingByEmail = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingByEmail) {
            user = await prisma_1.prisma.user.update({
                where: { id: existingByEmail.id },
                data: { firebaseUid: decoded.uid },
            });
        }
        else {
            user = await prisma_1.prisma.user.create({
                data: {
                    firebaseUid: decoded.uid,
                    email,
                    name: decoded.name ?? email.split("@")[0],
                },
            });
        }
    }
    else if (!user.name && decoded.name) {
        user = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { name: decoded.name },
        });
    }
    return user;
};
const matchesScope = (client, scope) => {
    if (!scope) {
        return true;
    }
    if (scope.userId && client.userId !== scope.userId) {
        return false;
    }
    if (scope.organizationId &&
        client.organizationId !== scope.organizationId) {
        return false;
    }
    return true;
};
const sendMessage = (socket, message) => {
    if (socket.readyState !== ws_1.default.OPEN) {
        return;
    }
    socket.send(JSON.stringify(message));
};
const broadcast = (event) => {
    clients.forEach((client) => {
        if (!matchesScope(client, event.scope)) {
            return;
        }
        if (client.subscriptions.size > 0 &&
            !client.subscriptions.has(event.type)) {
            return;
        }
        sendMessage(client.socket, event);
    });
};
exports.broadcast = broadcast;
const handleMessage = (client, raw) => {
    try {
        const payload = JSON.parse(raw.toString());
        if (payload.type === "subscribe" && Array.isArray(payload.channels)) {
            client.subscriptions = new Set(payload.channels);
            sendMessage(client.socket, {
                type: "subscriptions.updated",
                payload: { channels: Array.from(client.subscriptions) },
            });
            return;
        }
        if (payload.type === "ping") {
            sendMessage(client.socket, { type: "pong" });
        }
    }
    catch {
        // Ignore malformed payloads.
    }
};
const startHeartbeat = () => {
    const interval = setInterval(() => {
        clients.forEach((client) => {
            if (!client.isAlive) {
                client.socket.terminate();
                clients.delete(client);
                return;
            }
            client.isAlive = false;
            client.socket.ping();
        });
    }, 30000);
    interval.unref?.();
};
let heartbeatStarted = false;
const initRealtimeServer = (server) => {
    const wss = new ws_1.WebSocketServer({ server, path: "/ws" });
    if (!heartbeatStarted) {
        startHeartbeat();
        heartbeatStarted = true;
    }
    wss.on("connection", async (socket, req) => {
        const token = parseTokenFromRequest(req);
        if (!token) {
            socket.close(4401, "Missing auth token");
            return;
        }
        try {
            const user = await ensureUserFromToken(token);
            if (user.organizationId) {
                const org = await prisma_1.prisma.organization.findUnique({
                    where: { id: user.organizationId },
                    select: { isActive: true },
                });
                if (!org) {
                    socket.close(4404, "Organization not found");
                    return;
                }
                if (!org.isActive) {
                    socket.close(4403, "Organization is inactive");
                    return;
                }
            }
            const client = {
                socket,
                userId: user.id,
                firebaseUid: user.firebaseUid,
                email: user.email,
                name: user.name ?? null,
                role: user.role,
                organizationId: user.organizationId,
                isAlive: true,
                subscriptions: new Set(),
            };
            clients.add(client);
            socket.on("pong", () => {
                client.isAlive = true;
            });
            socket.on("message", (data) => handleMessage(client, data));
            socket.on("close", () => {
                clients.delete(client);
            });
            sendMessage(socket, {
                type: "connection.ready",
                payload: {
                    userId: client.userId,
                    organizationId: client.organizationId,
                    role: client.role,
                },
            });
        }
        catch (error) {
            socket.close(4401, "Invalid or expired token");
        }
    });
};
exports.initRealtimeServer = initRealtimeServer;
