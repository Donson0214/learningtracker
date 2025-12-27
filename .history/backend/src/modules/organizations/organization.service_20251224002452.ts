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
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: { users: true },
  });
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
