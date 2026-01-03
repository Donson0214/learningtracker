import { Response } from "express";
import crypto from "crypto";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { broadcast } from "../../realtime/realtime";
import { sendInviteEmail } from "./invite.mailer";
import * as inviteService from "./invite.service";
import { prisma } from "../../prisma";
import {
  createNotification,
  sendPushNotification,
} from "../notifications/notification.service";

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

const getInviteNotificationContent = (
  invitedBy: string,
  organizationName: string
) => {
  const title = "Organization Invitation";
  const body = `${invitedBy} invited you to join ${organizationName}.`;
  return { title, body };
};

const getInviteEmailErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("smtp_user") || message.includes("smtp_pass")) {
      return "Email service is not configured. Set SMTP_USER and SMTP_PASS.";
    }
    if (message.includes("auth")) {
      return "Email authentication failed. Check SMTP credentials.";
    }
  }
  return "Email delivery failed.";
};

const notifyInvitee = async (
  userId: string,
  invitedBy: string,
  organizationName: string
) => {
  const { title, body } = getInviteNotificationContent(
    invitedBy,
    organizationName
  );
  await createNotification(userId, title, body);
  const tokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true },
  });
  for (const entry of tokens) {
    try {
      await sendPushNotification(entry.token, title, body);
    } catch (error) {
      console.warn("Failed to send invite push notification:", error);
    }
  }
  broadcast({
    type: "notifications.changed",
    scope: { userId },
  });
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
      email: { equals: normalizedEmail, mode: "insensitive" },
      organizationId: req.user.organizationId,
    },
    select: { id: true },
  });
  if (existingMember) {
    return res
      .status(409)
      .json({ message: "User already belongs to this organization" });
  }

  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    select: { id: true },
  });

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
  const organizationName = organization?.name ?? "your organization";

  let emailSent = true;
  let emailError: string | null = null;
  try {
    await sendInviteEmail({
      to: invite.email,
      organizationName,
      invitedBy,
      inviteLink,
      expiresInDays,
    });
  } catch (error) {
    emailSent = false;
    emailError = getInviteEmailErrorMessage(error);
    console.warn("Failed to send invite email:", error);
  }

  if (existingUser) {
    try {
      await notifyInvitee(existingUser.id, invitedBy, organizationName);
    } catch (error) {
      console.warn("Failed to notify invitee:", error);
    }
    broadcast({
      type: "invites.changed",
      scope: { userId: existingUser.id },
    });
  }

  broadcast({
    type: "invites.changed",
    scope: { organizationId: req.user.organizationId },
  });

  res.status(201).json({
    ...invite,
    emailSent,
    emailError,
    inviteLink,
  });
};

export const listMyInvites = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const email = req.user?.email;
  if (!email) {
    return res.status(404).json({ message: "User not found" });
  }

  const invites = await inviteService.listInvitesForEmail(email);
  res.json(invites);
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

export const acceptInviteById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const result = await inviteService.acceptInviteById({
    inviteId: req.params.id,
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
    broadcast({
      type: "invites.changed",
      scope: { organizationId: result.invite.organizationId },
    });
  }
  broadcast({
    type: "invites.changed",
    scope: { userId: req.user!.id },
  });
  broadcast({
    type: "users.changed",
    scope: { userId: req.user!.id },
  });
  if (result.user.organization?.id) {
    broadcast({
      type: "organizations.changed",
      scope: { organizationId: result.user.organization.id },
    });
  }

  res.json({ success: true, user: result.user });
};

export const declineInviteById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const result = await inviteService.declineInviteById({
    inviteId: req.params.id,
    userId: req.user!.id,
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
    broadcast({
      type: "invites.changed",
      scope: { organizationId: result.invite.organizationId },
    });
  }
  broadcast({
    type: "invites.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};
