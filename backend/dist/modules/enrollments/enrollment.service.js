"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrollmentsForCourse = exports.getEnrollmentsForUser = exports.unenrollUser = exports.enrollUser = void 0;
const prisma_1 = require("../../prisma");
const enrollUser = async (userId, courseId) => {
    return prisma_1.prisma.enrollment.create({
        data: {
            userId,
            courseId,
        },
    });
};
exports.enrollUser = enrollUser;
const unenrollUser = async (enrollmentId) => {
    return prisma_1.prisma.enrollment.delete({
        where: { id: enrollmentId },
    });
};
exports.unenrollUser = unenrollUser;
const getEnrollmentsForUser = async (userId) => {
    return prisma_1.prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: {
                    modules: {
                        include: { lessons: true },
                    },
                },
            },
        },
    });
};
exports.getEnrollmentsForUser = getEnrollmentsForUser;
const getEnrollmentsForCourse = async (courseId) => {
    return prisma_1.prisma.enrollment.findMany({
        where: { courseId },
        include: { user: true },
    });
};
exports.getEnrollmentsForCourse = getEnrollmentsForCourse;
