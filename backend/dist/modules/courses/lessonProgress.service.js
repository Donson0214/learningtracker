"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearLessonCompletion = exports.completeLesson = exports.getLessonCourseId = void 0;
const prisma_1 = require("../../prisma");
const getLessonCourseId = async (lessonId) => {
    const lesson = await prisma_1.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: {
            id: true,
            module: {
                select: {
                    courseId: true,
                },
            },
        },
    });
    if (!lesson) {
        return null;
    }
    return {
        lessonId: lesson.id,
        courseId: lesson.module.courseId,
    };
};
exports.getLessonCourseId = getLessonCourseId;
const completeLesson = async (userId, lessonId) => {
    return prisma_1.prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: {
            completedAt: new Date(),
        },
        create: {
            userId,
            lessonId,
        },
    });
};
exports.completeLesson = completeLesson;
const clearLessonCompletion = async (userId, lessonId) => {
    return prisma_1.prisma.lessonProgress.deleteMany({
        where: { userId, lessonId },
    });
};
exports.clearLessonCompletion = clearLessonCompletion;
