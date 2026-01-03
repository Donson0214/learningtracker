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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineInviteById = exports.acceptInviteById = exports.acceptInvite = exports.revokeInvite = exports.listInvites = exports.listMyInvites = exports.createInvite = void 0;
const crypto_1 = __importDefault(require("crypto"));
const realtime_1 = require("../../realtime/realtime");
const invite_mailer_1 = require("./invite.mailer");
const inviteService = __importStar(require("./invite.service"));
const prisma_1 = require("../../prisma");
const allowedRoles = new Set(["LEARNER", "ORG_ADMIN"]);
const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";
const getInviteExpiryDays = () => {
    const raw = process.env.INVITE_EXPIRY_DAYS;
    const parsed = raw ? Number(raw) : 7;
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 7;
    }
    return Math.floor(parsed);
};
const createInvite = async (req, res) => {
    const { email, role } = req.body;
    if (!req.user?.organizationId) {
        return res.status(400).json({ message: "No organization assigned" });
    }
    if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existingMember = await prisma_1.prisma.user.findFirst({
        where: {
            email: normalizedEmail,
            organizationId: req.user.organizationId,
        },
        select: { id: true },
    });
    if (existingMember) {
        return res
            .status(409)
            .json({ message: "User already belongs to this organization" });
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
    });
    const inviteRole = role?.toUpperCase() || "LEARNER";
    if (!allowedRoles.has(inviteRole)) {
        return res.status(400).json({ message: "Invalid role" });
    }
    const token = crypto_1.default.randomBytes(32).toString("hex");
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const expiresInDays = getInviteExpiryDays();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    const invite = await inviteService.createInvite({
        organizationId: req.user.organizationId,
        email: normalizedEmail,
        role: inviteRole,
        tokenHash,
        invitedById: req.user.id,
        expiresAt,
    });
    const inviteLink = `${getFrontendUrl().replace(/\/$/, "")}/invite?token=${token}`;
    const invitedBy = req.user.name || req.user.email;
    const organization = await prisma_1.prisma.organization.findUnique({
        where: { id: req.user.organizationId },
        select: { name: true },
    });
    let emailSent = true;
    try {
        await (0, invite_mailer_1.sendInviteEmail)({
            to: invite.email,
            organizationName: organization?.name ?? "your organization",
            invitedBy,
            inviteLink,
            expiresInDays,
        });
    }
    catch (error) {
        emailSent = false;
        console.warn("Failed to send invite email:", error);
    }
    if (existingUser) {
        (0, realtime_1.broadcast)({
            type: "invites.changed",
            scope: { userId: existingUser.id },
        });
    }
    (0, realtime_1.broadcast)({
        type: "invites.changed",
        scope: { organizationId: req.user.organizationId },
    });
    res.status(201).json({
        ...invite,
        emailSent,
        inviteLink,
    });
};
exports.createInvite = createInvite;
const listMyInvites = async (req, res) => {
    const email = req.user?.email;
    if (!email) {
        return res.status(404).json({ message: "User not found" });
    }
    const invites = await inviteService.listInvitesForEmail(email);
    res.json(invites);
};
exports.listMyInvites = listMyInvites;
const listInvites = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(400).json({ message: "No organization assigned" });
    }
    const invites = await inviteService.listInvites(req.user.organizationId);
    res.json(invites);
};
exports.listInvites = listInvites;
const revokeInvite = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(400).json({ message: "No organization assigned" });
    }
    const result = await inviteService.revokeInvite(req.params.id, req.user.organizationId);
    if (result.count === 0) {
        return res.status(404).json({ message: "Invite not found" });
    }
    (0, realtime_1.broadcast)({
        type: "invites.changed",
        scope: { organizationId: req.user.organizationId },
    });
    res.json({ success: true });
};
exports.revokeInvite = revokeInvite;
const acceptInvite = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "token is required" });
    }
    const tokenHash = crypto_1.default
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const result = await inviteService.acceptInvite({
        tokenHash,
        userId: req.user.id,
    });
    if (result.status === "NOT_FOUND") {
        return res.status(404).json({ message: "Invite not found" });
    }
    if (result.status === "EXPIRED") {
        return res.status(410).json({ message: "Invite expired" });
    }
    if (result.status === "INACTIVE") {
        return res.status(403).json({ message: "Organization is inactive" });
    }
    if (result.status === "ORG_CONFLICT") {
        return res.status(409).json({ message: "Already assigned to another organization" });
    }
    if (result.status === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
    }
    if (result.invite?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "invites.changed",
            scope: { organizationId: result.invite.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "users.changed",
        scope: { userId: result.user.id },
    });
    if (result.user.organization?.id) {
        (0, realtime_1.broadcast)({
            type: "organizations.changed",
            scope: { organizationId: result.user.organization.id },
        });
    }
    res.json({ success: true, user: result.user });
};
exports.acceptInvite = acceptInvite;
const acceptInviteById = async (req, res) => {
    const result = await inviteService.acceptInviteById({
        inviteId: req.params.id,
        userId: req.user.id,
    });
    if (result.status === "NOT_FOUND") {
        return res.status(404).json({ message: "Invite not found" });
    }
    if (result.status === "EXPIRED") {
        return res.status(410).json({ message: "Invite expired" });
    }
    if (result.status === "INACTIVE") {
        return res.status(403).json({ message: "Organization is inactive" });
    }
    if (result.status === "ORG_CONFLICT") {
        return res
            .status(409)
            .json({ message: "Already assigned to another organization" });
    }
    if (result.status === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
    }
    if (result.status === "EMAIL_MISMATCH") {
        return res.status(403).json({ message: "Invite does not match user" });
    }
    if (result.invite?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "invites.changed",
            scope: { organizationId: result.invite.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "invites.changed",
        scope: { userId: req.user.id },
    });
    (0, realtime_1.broadcast)({
        type: "users.changed",
        scope: { userId: req.user.id },
    });
    if (result.user.organization?.id) {
        (0, realtime_1.broadcast)({
            type: "organizations.changed",
            scope: { organizationId: result.user.organization.id },
        });
    }
    res.json({ success: true, user: result.user });
};
exports.acceptInviteById = acceptInviteById;
const declineInviteById = async (req, res) => {
    const result = await inviteService.declineInviteById({
        inviteId: req.params.id,
        userId: req.user.id,
    });
    if (result.status === "NOT_FOUND") {
        return res.status(404).json({ message: "Invite not found" });
    }
    if (result.status === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "User not found" });
    }
    if (result.status === "EMAIL_MISMATCH") {
        return res.status(403).json({ message: "Invite does not match user" });
    }
    if (result.invite?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "invites.changed",
            scope: { organizationId: result.invite.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "invites.changed",
        scope: { userId: req.user.id },
    });
    res.json({ success: true });
};
exports.declineInviteById = declineInviteById;
