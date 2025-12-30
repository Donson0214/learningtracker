import { prisma } from "../../prisma";

type InviteRole = "LEARNER" | "ORG_ADMIN" | "SYSTEM_ADMIN";

export const expireInvites = async (organizationId: string) => {
  await prisma.organizationInvite.updateMany({
    where: {
      organizationId,
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
};

export const findPendingInvite = async (
  organizationId: string,
  email: string
) => {
  return prisma.organizationInvite.findFirst({
    where: {
      organizationId,
      email,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createInvite = async (payload: {
  organizationId: string;
  email: string;
  role: InviteRole;
  tokenHash: string;
  invitedById: string;
  expiresAt: Date;
}) => {
  const existing = await findPendingInvite(
    payload.organizationId,
    payload.email
  );

  if (existing) {
    return prisma.organizationInvite.update({
      where: { id: existing.id },
      data: {
        tokenHash: payload.tokenHash,
        role: payload.role,
        invitedById: payload.invitedById,
        expiresAt: payload.expiresAt,
        status: "PENDING",
        revokedAt: null,
      },
    });
  }

  return prisma.organizationInvite.create({
    data: {
      organizationId: payload.organizationId,
      email: payload.email,
      role: payload.role,
      tokenHash: payload.tokenHash,
      invitedById: payload.invitedById,
      expiresAt: payload.expiresAt,
    },
  });
};

export const listInvites = async (organizationId: string) => {
  await expireInvites(organizationId);
  return prisma.organizationInvite.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: { select: { id: true, name: true, email: true } },
      acceptedBy: { select: { id: true, name: true, email: true } },
    },
  });
};

export const listInvitesForEmail = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  await prisma.organizationInvite.updateMany({
    where: {
      email: normalizedEmail,
      status: "PENDING",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });
  return prisma.organizationInvite.findMany({
    where: {
      email: normalizedEmail,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { id: true, name: true } },
      invitedBy: { select: { id: true, name: true, email: true } },
    },
  });
};

export const revokeInvite = async (
  inviteId: string,
  organizationId: string
) => {
  return prisma.organizationInvite.updateMany({
    where: { id: inviteId, organizationId, status: "PENDING" },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
};

const roleRank: Record<InviteRole, number> = {
  LEARNER: 0,
  ORG_ADMIN: 1,
  SYSTEM_ADMIN: 2,
};

export const acceptInviteById = async (payload: {
  inviteId: string;
  userId: string;
}) => {
  const invite = await prisma.organizationInvite.findFirst({
    where: { id: payload.inviteId, status: "PENDING" },
    include: { organization: true },
  });

  if (!invite) {
    return { status: "NOT_FOUND" as const };
  }

  const now = new Date();
  if (invite.expiresAt <= now) {
    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return { status: "EXPIRED" as const };
  }

  if (!invite.organization.isActive) {
    return { status: "INACTIVE" as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { organization: { select: { isActive: true } } },
  });

  if (!user) {
    return { status: "USER_NOT_FOUND" as const };
  }

  if (user.email.toLowerCase() !== invite.email) {
    return { status: "EMAIL_MISMATCH" as const };
  }

  if (
    user.organizationId &&
    user.organizationId !== invite.organizationId &&
    user.organization?.isActive
  ) {
    return { status: "ORG_CONFLICT" as const };
  }

  const nextRole =
    roleRank[invite.role] > roleRank[user.role]
      ? invite.role
      : user.role;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      organizationId: invite.organizationId,
      role: nextRole,
    },
    include: { organization: true },
  });

  const updatedInvite = await prisma.organizationInvite.update({
    where: { id: invite.id },
    data: {
      status: "ACCEPTED",
      acceptedAt: now,
      acceptedById: user.id,
    },
  });

  return {
    status: "ACCEPTED" as const,
    invite: updatedInvite,
    user: updatedUser,
  };
};

export const acceptInvite = async (payload: {
  tokenHash: string;
  userId: string;
}) => {
  const invite = await prisma.organizationInvite.findFirst({
    where: { tokenHash: payload.tokenHash, status: "PENDING" },
    include: { organization: true },
  });

  if (!invite) {
    return { status: "NOT_FOUND" as const };
  }

  const now = new Date();
  if (invite.expiresAt <= now) {
    await prisma.organizationInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return { status: "EXPIRED" as const };
  }

  if (!invite.organization.isActive) {
    return { status: "INACTIVE" as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { organization: { select: { isActive: true } } },
  });

  if (!user) {
    return { status: "USER_NOT_FOUND" as const };
  }

  if (
    user.organizationId &&
    user.organizationId !== invite.organizationId &&
    user.organization?.isActive
  ) {
    return { status: "ORG_CONFLICT" as const };
  }

  const nextRole =
    roleRank[invite.role] > roleRank[user.role]
      ? invite.role
      : user.role;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      organizationId: invite.organizationId,
      role: nextRole,
    },
    include: { organization: true },
  });

  const updatedInvite = await prisma.organizationInvite.update({
    where: { id: invite.id },
    data: {
      status: "ACCEPTED",
      acceptedAt: now,
      acceptedById: user.id,
    },
  });

  return {
    status: "ACCEPTED" as const,
    invite: updatedInvite,
    user: updatedUser,
  };
};

export const declineInviteById = async (payload: {
  inviteId: string;
  userId: string;
}) => {
  const invite = await prisma.organizationInvite.findFirst({
    where: { id: payload.inviteId, status: "PENDING" },
  });

  if (!invite) {
    return { status: "NOT_FOUND" as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    return { status: "USER_NOT_FOUND" as const };
  }

  if (user.email.toLowerCase() !== invite.email) {
    return { status: "EMAIL_MISMATCH" as const };
  }

  const updatedInvite = await prisma.organizationInvite.update({
    where: { id: invite.id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  return {
    status: "DECLINED" as const,
    invite: updatedInvite,
  };
};
