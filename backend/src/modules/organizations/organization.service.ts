import { prisma } from "../../prisma";

export const createOrganization = async (
  name: string,
  adminUserId: string
) => {
  return prisma.organization.create({
    data: {
      name,
      users: {
        connect: { id: adminUserId },
      },
    },
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
