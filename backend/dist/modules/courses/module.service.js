"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModule = exports.updateModule = exports.getModuleByIdForOrg = exports.getModulesByCourse = exports.createModule = void 0;
const prisma_1 = require("../../prisma");
const createModule = async (courseId, data) => {
    return prisma_1.prisma.module.create({
        data: {
            ...data,
            courseId,
        },
    });
};
exports.createModule = createModule;
const getModulesByCourse = async (courseId) => {
    return prisma_1.prisma.module.findMany({
        where: { courseId },
        include: { lessons: true },
        orderBy: { order: "asc" },
    });
};
exports.getModulesByCourse = getModulesByCourse;
const getModuleByIdForOrg = async (moduleId, organizationId) => {
    return prisma_1.prisma.module.findFirst({
        where: {
            id: moduleId,
            course: { organizationId },
        },
    });
};
exports.getModuleByIdForOrg = getModuleByIdForOrg;
const updateModule = async (moduleId, data) => {
    return prisma_1.prisma.module.update({
        where: { id: moduleId },
        data,
    });
};
exports.updateModule = updateModule;
const deleteModule = async (moduleId) => {
    return prisma_1.prisma.module.delete({
        where: { id: moduleId },
    });
};
exports.deleteModule = deleteModule;
