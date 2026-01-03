"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnrollmentsForUserInOrg = exports.getEnrollmentsForCourse = exports.getEnrollmentsForUser = exports.getEnrollmentByIdForOrg = exports.unenrollUser = exports.enrollUser = void 0;
const prisma_1 = require("../../prisma");
const mapLessonsWithProgress = (lessons) => lessons.map(({ lessonProgresses, ...lesson }) => ({
    ...lesson,
    isCompleted: Boolean(lessonProgresses?.length),
    completedAt: lessonProgresses?.[0]?.completedAt ?? null,
}));
const mapCourseWithProgress = (course) => ({
    ...course,
    modules: course.modules?.map((module) => ({
        ...module,
        lessons: module.lessons ? mapLessonsWithProgress(module.lessons) : [],
    })),
});
const enrollUser = async (userId, courseId) => {
    return prisma_1.prisma.enrollment.create({
        data: {
            userId,
            courseId,
        },
        include: {
            course: true,
        },
    });
};
exports.enrollUser = enrollUser;
const unenrollUser = async (enrollmentId) => {
    return prisma_1.prisma.enrollment.delete({
        where: { id: enrollmentId },
        include: {
            course: true,
        },
    });
};
exports.unenrollUser = unenrollUser;
const getEnrollmentByIdForOrg = async (enrollmentId, organizationId) => {
    return prisma_1.prisma.enrollment.findFirst({
        where: {
            id: enrollmentId,
            course: { organizationId },
        },
        include: { course: true },
    });
};
exports.getEnrollmentByIdForOrg = getEnrollmentByIdForOrg;
const getEnrollmentsForUser = async (userId) => {
    return prisma_1.prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: {
                    modules: {
                        include: {
                            lessons: {
                                include: {
                                    lessonProgresses: {
                                        where: { userId },
                                        select: { completedAt: true },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    }).then((enrollments) => enrollments.map((enrollment) => ({
        ...enrollment,
        course: enrollment.course
            ? mapCourseWithProgress(enrollment.course)
            : enrollment.course,
    })));
};
exports.getEnrollmentsForUser = getEnrollmentsForUser;
const getEnrollmentsForCourse = async (courseId) => {
    return prisma_1.prisma.enrollment.findMany({
        where: { courseId },
        include: { user: true },
    });
};
exports.getEnrollmentsForCourse = getEnrollmentsForCourse;
const getEnrollmentsForUserInOrg = async (userId, organizationId) => {
    return prisma_1.prisma.enrollment.findMany({
        where: {
            userId,
            course: { organizationId },
        },
        select: {
            id: true,
            userId: true,
            courseId: true,
        },
    });
};
exports.getEnrollmentsForUserInOrg = getEnrollmentsForUserInOrg;
