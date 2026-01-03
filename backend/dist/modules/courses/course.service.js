"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCourseForLearnerById = exports.getCourseById = exports.getCoursesForLearnerPaged = exports.getCoursesByOrgPaged = exports.getCoursesByOrg = exports.createCourse = void 0;
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
const getCoursesByOrgPaged = async (organizationId, options) => {
    const includeModules = Boolean(options.includeModules);
    const [courses, total] = await Promise.all([
        prisma_1.prisma.course.findMany({
            where: { organizationId },
            orderBy: { createdAt: "desc" },
            skip: options.skip,
            take: options.take,
            include: {
                ...(includeModules
                    ? {
                        modules: {
                            include: { lessons: true },
                        },
                    }
                    : {}),
                _count: {
                    select: { modules: true },
                },
            },
        }),
        prisma_1.prisma.course.count({ where: { organizationId } }),
    ]);
    const items = courses.map(({ _count, ...course }) => ({
        ...course,
        modulesCount: _count.modules,
    }));
    return { items, total };
};
exports.getCoursesByOrgPaged = getCoursesByOrgPaged;
const getCoursesForLearnerPaged = async (userId, options) => {
    const includeModules = Boolean(options.includeModules);
    if (includeModules) {
        const [enrollments, total] = await Promise.all([
            prisma_1.prisma.enrollment.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                skip: options.skip,
                take: options.take,
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
                            _count: {
                                select: { modules: true },
                            },
                        },
                    },
                },
            }),
            prisma_1.prisma.enrollment.count({ where: { userId } }),
        ]);
        const items = enrollments.map((enrollment) => {
            const { _count, ...course } = enrollment.course;
            return {
                ...mapCourseWithProgress(course),
                modulesCount: _count.modules,
            };
        });
        return { items, total };
    }
    const [enrollments, total] = await Promise.all([
        prisma_1.prisma.enrollment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip: options.skip,
            take: options.take,
            include: {
                course: {
                    include: {
                        _count: {
                            select: { modules: true },
                        },
                    },
                },
            },
        }),
        prisma_1.prisma.enrollment.count({ where: { userId } }),
    ]);
    const items = enrollments.map((enrollment) => {
        const { _count, ...course } = enrollment.course;
        return {
            ...course,
            modulesCount: _count.modules,
        };
    });
    return { items, total };
};
exports.getCoursesForLearnerPaged = getCoursesForLearnerPaged;
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
const getCourseForLearnerById = async (courseId, userId) => {
    const enrollment = await prisma_1.prisma.enrollment.findFirst({
        where: { courseId, userId },
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
    });
    if (!enrollment?.course) {
        return null;
    }
    return mapCourseWithProgress(enrollment.course);
};
exports.getCourseForLearnerById = getCourseForLearnerById;
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
