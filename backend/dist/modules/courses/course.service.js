"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.getCoursesByOrg = exports.createCourse = void 0;
const prisma_1 = require("../../prisma");
const createCourse = async (organizationId, data) => {
    return prisma_1.prisma.course.create({
        data: {
            ...data,
            organizationId,
        },
    });
};
exports.createCourse = createCourse;
const getCoursesByOrg = async (organizationId) => {
    return prisma_1.prisma.course.findMany({
        where: { organizationId },
        include: {
            modules: {
                include: { lessons: true },
            },
        },
    });
};
exports.getCoursesByOrg = getCoursesByOrg;
const getCourseById = async (courseId, organizationId) => {
    return prisma_1.prisma.course.findFirst({
        where: { id: courseId, organizationId },
        include: {
            modules: {
                include: { lessons: true },
            },
        },
    });
};
exports.getCourseById = getCourseById;
const updateCourse = async (courseId, organizationId, data) => {
    return prisma_1.prisma.course.updateMany({
        where: { id: courseId, organizationId },
        data,
    });
};
exports.updateCourse = updateCourse;
const deleteCourse = async (courseId, organizationId) => {
    return prisma_1.prisma.course.deleteMany({
        where: { id: courseId, organizationId },
    });
};
exports.deleteCourse = deleteCourse;
