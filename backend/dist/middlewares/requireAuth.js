"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const firebase_1 = require("../config/firebase");
const prisma_1 = require("../prisma");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Missing auth token" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = await firebase_1.firebaseAdmin.auth().verifyIdToken(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { firebaseUid: decoded.uid },
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        req.user = {
            id: user.id,
            role: user.role,
            organizationId: user.organizationId,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;
