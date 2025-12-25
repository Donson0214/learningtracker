"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateOrganization = exports.updateOrganization = exports.getOrganizationById = exports.createOrganization = void 0;
const prisma_1 = require("../../prisma");
const createOrganization = async (name, adminUserId) => {
    return prisma_1.prisma.organization.create({
        data: {
            name,
            users: {
                connect: { id: adminUserId },
            },
        },
    });
};
exports.createOrganization = createOrganization;
const getOrganizationById = async (organizationId) => {
    return prisma_1.prisma.organization.findUnique({
        where: { id: organizationId },
        include: { users: true },
    });
};
exports.getOrganizationById = getOrganizationById;
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
