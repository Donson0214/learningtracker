"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineInviteById = exports.acceptInvite = exports.acceptInviteById = exports.revokeInvite = exports.listInvitesForEmail = exports.listInvites = exports.createInvite = exports.findPendingInvite = exports.expireInvites = void 0;
const prisma_1 = require("../../prisma");
const expireInvites = async (organizationId) => {
    await prisma_1.prisma.organizationInvite.updateMany({
        where: {
            organizationId,
            status: "PENDING",
            expiresAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
    });
};
exports.expireInvites = expireInvites;
const findPendingInvite = async (organizationId, email) => {
    return prisma_1.prisma.organizationInvite.findFirst({
        where: {
            organizationId,
            email,
            status: "PENDING",
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });
};
exports.findPendingInvite = findPendingInvite;
const createInvite = async (payload) => {
    const existing = await (0, exports.findPendingInvite)(payload.organizationId, payload.email);
    if (existing) {
        return prisma_1.prisma.organizationInvite.update({
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
    return prisma_1.prisma.organizationInvite.create({
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
exports.createInvite = createInvite;
const listInvites = async (organizationId) => {
    await (0, exports.expireInvites)(organizationId);
    return prisma_1.prisma.organizationInvite.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        include: {
            invitedBy: { select: { id: true, name: true, email: true } },
            acceptedBy: { select: { id: true, name: true, email: true } },
        },
    });
};
exports.listInvites = listInvites;
const listInvitesForEmail = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    await prisma_1.prisma.organizationInvite.updateMany({
        where: {
            email: normalizedEmail,
            status: "PENDING",
            expiresAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
    });
    return prisma_1.prisma.organizationInvite.findMany({
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
exports.listInvitesForEmail = listInvitesForEmail;
const revokeInvite = async (inviteId, organizationId) => {
    return prisma_1.prisma.organizationInvite.updateMany({
        where: { id: inviteId, organizationId, status: "PENDING" },
        data: { status: "REVOKED", revokedAt: new Date() },
    });
};
exports.revokeInvite = revokeInvite;
const roleRank = {
    LEARNER: 0,
    ORG_ADMIN: 1,
    SYSTEM_ADMIN: 2,
};
const acceptInviteById = async (payload) => {
    const invite = await prisma_1.prisma.organizationInvite.findFirst({
        where: { id: payload.inviteId, status: "PENDING" },
        include: { organization: true },
    });
    if (!invite) {
        return { status: "NOT_FOUND" };
    }
    const now = new Date();
    if (invite.expiresAt <= now) {
        await prisma_1.prisma.organizationInvite.update({
            where: { id: invite.id },
            data: { status: "EXPIRED" },
        });
        return { status: "EXPIRED" };
    }
    if (!invite.organization.isActive) {
        return { status: "INACTIVE" };
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: payload.userId },
        include: { organization: { select: { isActive: true } } },
    });
    if (!user) {
        return { status: "USER_NOT_FOUND" };
    }
    if (user.email.toLowerCase() !== invite.email) {
        return { status: "EMAIL_MISMATCH" };
    }
    if (user.organizationId &&
        user.organizationId !== invite.organizationId &&
        user.organization?.isActive) {
        return { status: "ORG_CONFLICT" };
    }
    const nextRole = roleRank[invite.role] > roleRank[user.role]
        ? invite.role
        : user.role;
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            organizationId: invite.organizationId,
            role: nextRole,
        },
        include: { organization: true },
    });
    const updatedInvite = await prisma_1.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: {
            status: "ACCEPTED",
            acceptedAt: now,
            acceptedById: user.id,
        },
    });
    return {
        status: "ACCEPTED",
        invite: updatedInvite,
        user: updatedUser,
    };
};
exports.acceptInviteById = acceptInviteById;
const acceptInvite = async (payload) => {
    const invite = await prisma_1.prisma.organizationInvite.findFirst({
        where: { tokenHash: payload.tokenHash, status: "PENDING" },
        include: { organization: true },
    });
    if (!invite) {
        return { status: "NOT_FOUND" };
    }
    const now = new Date();
    if (invite.expiresAt <= now) {
        await prisma_1.prisma.organizationInvite.update({
            where: { id: invite.id },
            data: { status: "EXPIRED" },
        });
        return { status: "EXPIRED" };
    }
    if (!invite.organization.isActive) {
        return { status: "INACTIVE" };
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: payload.userId },
        include: { organization: { select: { isActive: true } } },
    });
    if (!user) {
        return { status: "USER_NOT_FOUND" };
    }
    if (user.organizationId &&
        user.organizationId !== invite.organizationId &&
        user.organization?.isActive) {
        return { status: "ORG_CONFLICT" };
    }
    const nextRole = roleRank[invite.role] > roleRank[user.role]
        ? invite.role
        : user.role;
    const updatedUser = await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            organizationId: invite.organizationId,
            role: nextRole,
        },
        include: { organization: true },
    });
    const updatedInvite = await prisma_1.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: {
            status: "ACCEPTED",
            acceptedAt: now,
            acceptedById: user.id,
        },
    });
    return {
        status: "ACCEPTED",
        invite: updatedInvite,
        user: updatedUser,
    };
};
exports.acceptInvite = acceptInvite;
const declineInviteById = async (payload) => {
    const invite = await prisma_1.prisma.organizationInvite.findFirst({
        where: { id: payload.inviteId, status: "PENDING" },
    });
    if (!invite) {
        return { status: "NOT_FOUND" };
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: payload.userId },
    });
    if (!user) {
        return { status: "USER_NOT_FOUND" };
    }
    if (user.email.toLowerCase() !== invite.email) {
        return { status: "EMAIL_MISMATCH" };
    }
    const updatedInvite = await prisma_1.prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: "REVOKED", revokedAt: new Date() },
    });
    return {
        status: "DECLINED",
        invite: updatedInvite,
    };
};
exports.declineInviteById = declineInviteById;
