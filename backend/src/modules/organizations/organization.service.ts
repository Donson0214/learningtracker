import { prisma } from "../../prisma";

export const createOrganization = async (
  name: string,
  userId: string,
  nextRole: "LEARNER" | "ORG_ADMIN" | "SYSTEM_ADMIN"
) => {
  return prisma.$transaction(async (tx) => {
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

export const getOrganizationById = async (organizationId: string) => {
  const org = await prisma.organization.findUnique({
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

export const getOrganizationMembersPaged = async (
  organizationId: string,
  options: { skip: number; take: number }
) => {
  const [members, total, learners, admins] = await Promise.all([
    prisma.user.findMany({
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
    prisma.user.count({ where: { organizationId } }),
    prisma.user.count({
      where: { organizationId, role: "LEARNER" },
    }),
    prisma.user.count({
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

export const updateOrganization = async (
  organizationId: string,
  name: string
) => {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { name },
  });
};

export const deactivateOrganization = async (organizationId: string) => {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { isActive: false },
  });
};

export const activateOrganization = async (organizationId: string) => {
  return prisma.organization.update({
    where: { id: organizationId },
    data: { isActive: true },
  });
};

export const removeOrganizationMember = async (
  organizationId: string,
  memberId: string
) => {
  return prisma.$transaction(async (tx) => {
    const member = await tx.user.findUnique({
      where: { id: memberId },
      select: { id: true, role: true, organizationId: true },
    });

    if (!member || member.organizationId !== organizationId) {
      return { status: "not_found" as const };
    }

    if (member.role === "SYSTEM_ADMIN") {
      return { status: "forbidden" as const, reason: "system_admin" };
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
        return { status: "forbidden" as const, reason: "last_admin" };
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

    return { status: "removed" as const, user: updated };
  });
};
