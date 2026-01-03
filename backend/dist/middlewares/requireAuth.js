"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const firebase_1 = require("../config/firebase");
const prisma_1 = require("../prisma");
const decodeJwtPayload = (token) => {
    try {
        const parts = token.split(".");
        if (parts.length < 2) {
            return null;
        }
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
        const json = Buffer.from(padded, "base64").toString("utf-8");
        return JSON.parse(json);
    }
    catch {
        return null;
    }
};
const shouldCheckRevoked = () => process.env.FIREBASE_CHECK_REVOKED === "true";
const isLikelyJwt = (token) => token.split(".").length === 3;
const getFirebaseAuthErrorMessage = (error, token) => {
    const code = error?.code;
    if (code === "auth/id-token-expired") {
        return "Token expired. Please sign in again.";
    }
    if (code === "auth/id-token-revoked") {
        return "Token revoked. Please sign in again.";
    }
    if (code === "auth/user-disabled") {
        return "User account is disabled.";
    }
    if (code === "auth/invalid-id-token" ||
        code === "auth/invalid-argument" ||
        code === "auth/argument-error") {
        if (token && !isLikelyJwt(token)) {
            return "Token is not a Firebase ID token.";
        }
        const expectedProject = process.env.FIREBASE_PROJECT_ID;
        const payload = token ? decodeJwtPayload(token) : null;
        if (payload?.aud &&
            expectedProject &&
            payload.aud !== expectedProject &&
            process.env.NODE_ENV !== "production") {
            return `Token project mismatch. Frontend uses ${payload.aud}, backend expects ${expectedProject}.`;
        }
    }
    if (code === "auth/invalid-credential") {
        return "Firebase Admin credentials are invalid. Check service account configuration.";
    }
    if (code === "auth/insufficient-permission") {
        return "Firebase Admin credentials lack permission to verify tokens.";
    }
    if (code === "auth/project-not-found") {
        return "Firebase project not found. Check FIREBASE_PROJECT_ID.";
    }
    if (code === "auth/internal-error") {
        return "Firebase token verification failed.";
    }
    return "Invalid or expired token";
};
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing auth token" });
    }
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
        return res.status(401).json({ message: "Missing auth token" });
    }
    let decoded;
    try {
        decoded = await firebase_1.firebaseAdmin
            .auth()
            .verifyIdToken(token, shouldCheckRevoked());
    }
    catch (error) {
        const code = error?.code ?? "unknown";
        if (process.env.NODE_ENV !== "production") {
            console.warn("Firebase verifyIdToken failed:", code);
        }
        return res
            .status(401)
            .json({ message: getFirebaseAuthErrorMessage(error, token) });
    }
    try {
        let user = await prisma_1.prisma.user.findUnique({
            where: { firebaseUid: decoded.uid },
        });
        if (!user) {
            const email = decoded.email;
            if (!email) {
                return res.status(401).json({ message: "User not found" });
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
        req.user = {
            id: user.id,
            firebaseUid: decoded.uid,
            email: user.email,
            name: user.name ?? null,
            role: user.role,
            organizationId: user.organizationId,
        };
        next();
    }
    catch (error) {
        console.error("Auth user lookup failed:", error);
        return res
            .status(500)
            .json({ message: "Failed to load user profile" });
    }
};
exports.requireAuth = requireAuth;
