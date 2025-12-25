import { Response } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { broadcast } from "../../realtime/realtime";
import { sendInviteEmail } from "./invite.mailer";
import * as inviteService from "./invite.service";
import { prisma } from "../../prisma";

const allowedRoles = new Set(["LEARNER", "ORG_ADMIN"]);

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

const getInviteExpiryDays = () => {
  const raw = process.env.INVITE_EXPIRY_DAYS;
  const parsed = raw ? Number(raw) : 7;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 7;
  }
  return Math.floor(parsed);
};

export const createInvite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { email, role } = req.body as {
    email?: string;
    role?: string;
  };

  if (!req.user?.organizationId) {
    return res.status(400).json({ message: "No organization assigned" });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingMember = await prisma.user.findFirst({
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

  const inviteRole = role?.toUpperCase() || "LEARNER";
  if (!allowedRoles.has(inviteRole)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresInDays = getInviteExpiryDays();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const invite = await inviteService.createInvite({
    organizationId: req.user.organizationId,
    email: normalizedEmail,
    role: inviteRole as "LEARNER" | "ORG_ADMIN",
    tokenHash,
    invitedById: req.user.id,
    expiresAt,
  });

  const inviteLink = `${getFrontendUrl().replace(/\/$/, "")}/invite?token=${token}`;
  const invitedBy = req.user.name || req.user.email;
  const organization = await prisma.organization.findUnique({
    where: { id: req.user.organizationId },
    select: { name: true },
  });

  try {
    await sendInviteEmail({
      to: invite.email,
      organizationName: organization?.name ?? "your organization",
      invitedBy,
      inviteLink,
      expiresInDays,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send invite email" });
  }

  broadcast({
    type: "invites.changed",
    scope: { organizationId: req.user.organizationId },
  });

  res.status(201).json(invite);
};

export const listInvites = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(400).json({ message: "No organization assigned" });
  }

  const invites = await inviteService.listInvites(req.user.organizationId);
  res.json(invites);
};

export const revokeInvite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.organizationId) {
    return res.status(400).json({ message: "No organization assigned" });
  }

  const result = await inviteService.revokeInvite(
    req.params.id,
    req.user.organizationId
  );

  if (result.count === 0) {
    return res.status(404).json({ message: "Invite not found" });
  }

  broadcast({
    type: "invites.changed",
    scope: { organizationId: req.user.organizationId },
  });

  res.json({ success: true });
};

export const acceptInvite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { token } = req.body as { token?: string };

  if (!token) {
    return res.status(400).json({ message: "token is required" });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const result = await inviteService.acceptInvite({
    tokenHash,
    userId: req.user!.id,
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
    broadcast({
      type: "invites.changed",
      scope: { organizationId: result.invite.organizationId },
    });
  }
  broadcast({
    type: "users.changed",
    scope: { userId: result.user.id },
  });
  if (result.user.organization?.id) {
    broadcast({
      type: "organizations.changed",
      scope: { organizationId: result.user.organization.id },
    });
  }

  res.json({ success: true, user: result.user });
};
