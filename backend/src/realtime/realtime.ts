import type { IncomingMessage } from "http";
import type { Server as HttpServer } from "http";
import WebSocket, { WebSocketServer } from "ws";
import type { RawData } from "ws";
import { firebaseAdmin } from "../config/firebase";
import { prisma } from "../prisma";

type RealtimeScope = {
  userId?: string;
  organizationId?: string;
};

export type RealtimeEvent = {
  type: string;
  payload?: Record<string, unknown>;
  scope?: RealtimeScope;
};

type RealtimeClient = {
  socket: WebSocket;
  userId: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  role: string;
  organizationId: string | null;
  isAlive: boolean;
  subscriptions: Set<string>;
};

const clients = new Set<RealtimeClient>();

const parseTokenFromRequest = (req: IncomingMessage) => {
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

const ensureUserFromToken = async (token: string) => {
  const decoded = await firebaseAdmin.auth().verifyIdToken(token, true);

  let user = await prisma.user.findUnique({
    where: { firebaseUid: decoded.uid },
  });

  if (!user) {
    const email = decoded.email;
    if (!email) {
      throw new Error("User not found");
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { firebaseUid: decoded.uid },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,
          email,
          name: decoded.name ?? email.split("@")[0],
        },
      });
    }
  } else if (!user.name && decoded.name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name: decoded.name },
    });
  }

  return user;
};

const matchesScope = (
  client: RealtimeClient,
  scope?: RealtimeScope
) => {
  if (!scope) {
    return true;
  }
  if (scope.userId && client.userId !== scope.userId) {
    return false;
  }
  if (
    scope.organizationId &&
    client.organizationId !== scope.organizationId
  ) {
    return false;
  }
  return true;
};

const sendMessage = (socket: WebSocket, message: RealtimeEvent) => {
  if (socket.readyState !== WebSocket.OPEN) {
    return;
  }
  socket.send(JSON.stringify(message));
};

export const broadcast = (event: RealtimeEvent) => {
  clients.forEach((client) => {
    if (!matchesScope(client, event.scope)) {
      return;
    }
    if (
      client.subscriptions.size > 0 &&
      !client.subscriptions.has(event.type)
    ) {
      return;
    }
    sendMessage(client.socket, event);
  });
};

const handleMessage = (
  client: RealtimeClient,
  raw: RawData
) => {
  try {
    const payload = JSON.parse(raw.toString()) as {
      type?: string;
      channels?: string[];
    };
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
  } catch {
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

export const initRealtimeServer = (server: HttpServer) => {
  const wss = new WebSocketServer({ server, path: "/ws" });

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
      const client: RealtimeClient = {
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
    } catch (error) {
      socket.close(4401, "Invalid or expired token");
    }
  });
};
