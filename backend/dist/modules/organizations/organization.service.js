"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = exports.removeOrganizationMember = exports.activateOrganization = exports.deactivateOrganization = exports.updateOrganization = exports.getOrganizationMembersPaged = exports.getOrganizationById = exports.createOrganization = void 0;
const prisma_1 = require("../../prisma");
const createOrganization = async (name, userId, nextRole) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const organization = await tx.organization.create({
            data: { name },
        });
        const user = await tx.user.update({
            where: { id: userId },
            data: {
                organizationId: organization.id,
                role: nextRole,
            },
        });
        return { organization, user };
    });
};
exports.createOrganization = createOrganization;
const getOrganizationById = async (organizationId) => {
    const org = await prisma_1.prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: { users: true },
            },
        },
    });
    if (!org) {
        return null;
    }
    return {
        id: org.id,
        name: org.name,
        isActive: org.isActive,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        memberCount: org._count.users,
    };
};
exports.getOrganizationById = getOrganizationById;
const getOrganizationMembersPaged = async (organizationId, options) => {
    const [members, total, learners, admins] = await Promise.all([
        prisma_1.prisma.user.findMany({
            where: { organizationId },
            orderBy: { createdAt: "desc" },
            skip: options.skip,
            take: options.take,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        }),
        prisma_1.prisma.user.count({ where: { organizationId } }),
        prisma_1.prisma.user.count({
            where: { organizationId, role: "LEARNER" },
        }),
        prisma_1.prisma.user.count({
            where: {
                organizationId,
                role: { in: ["ORG_ADMIN", "SYSTEM_ADMIN"] },
            },
        }),
    ]);
    return {
        items: members,
        total,
        summary: {
            total,
            learners,
            admins,
        },
    };
};
exports.getOrganizationMembersPaged = getOrganizationMembersPaged;
const updateOrganization = async (organizationId, name) => {
    return prisma_1.prisma.organization.update({
        where: { id: organizationId },
        data: { name },
    });
};
exports.updateOrganization = updateOrganization;
const deactivateOrganization = async (organizationId) => {
    return prisma_1.prisma.organization.update({
        where: { id: organizationId },
        data: { isActive: false },
    });
};
exports.deactivateOrganization = deactivateOrganization;
const activateOrganization = async (organizationId) => {
    return prisma_1.prisma.organization.update({
        where: { id: organizationId },
        data: { isActive: true },
    });
};
exports.activateOrganization = activateOrganization;
const removeOrganizationMember = async (organizationId, memberId) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const member = await tx.user.findUnique({
            where: { id: memberId },
            select: { id: true, role: true, organizationId: true },
        });
        if (!member || member.organizationId !== organizationId) {
            return { status: "not_found" };
        }
        if (member.role === "SYSTEM_ADMIN") {
            return { status: "forbidden", reason: "system_admin" };
        }
        if (member.role === "ORG_ADMIN") {
            const remainingAdmins = await tx.user.count({
                where: {
                    organizationId,
                    role: { in: ["ORG_ADMIN", "SYSTEM_ADMIN"] },
                    id: { not: memberId },
                },
            });
            if (!remainingAdmins) {
                return { status: "forbidden", reason: "last_admin" };
            }
        }
        await tx.enrollment.deleteMany({
            where: {
                userId: memberId,
                course: { organizationId },
            },
        });
        const updated = await tx.user.update({
            where: { id: memberId },
            data: {
                organizationId: null,
                role: "LEARNER",
            },
        });
        return { status: "removed", user: updated };
    });
};
exports.removeOrganizationMember = removeOrganizationMember;
const deleteOrganization = async (organizationId) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const org = await tx.organization.findUnique({
            where: { id: organizationId },
            select: { id: true, name: true },
        });
        if (!org) {
            return null;
        }
        await tx.studyPlanItem.deleteMany({
            where: { course: { organizationId } },
        });
        await tx.studySession.deleteMany({
            where: { course: { organizationId } },
        });
        await tx.enrollment.deleteMany({
            where: { course: { organizationId } },
        });
        await tx.lesson.deleteMany({
            where: { module: { course: { organizationId } } },
        });
        await tx.module.deleteMany({
            where: { course: { organizationId } },
        });
        await tx.course.deleteMany({
            where: { organizationId },
        });
        await tx.organizationInvite.deleteMany({
            where: { organizationId },
        });
        await tx.user.updateMany({
            where: {
                organizationId,
                role: { not: "SYSTEM_ADMIN" },
            },
            data: { organizationId: null, role: "LEARNER" },
        });
        await tx.user.updateMany({
            where: {
                organizationId,
                role: "SYSTEM_ADMIN",
            },
            data: { organizationId: null },
        });
        await tx.organization.delete({
            where: { id: organizationId },
        });
        return org;
    });
};
exports.deleteOrganization = deleteOrganization;
