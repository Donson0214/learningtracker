"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.updateLesson = exports.createLesson = void 0;
const prisma_1 = require("../../prisma");
const createLesson = async (moduleId, data) => {
    return prisma_1.prisma.lesson.create({
        data: {
            ...data,
            moduleId,
        },
    });
};
exports.createLesson = createLesson;
const updateLesson = async (lessonId, data) => {
    return prisma_1.prisma.lesson.update({
        where: { id: lessonId },
        data,
    });
};
exports.updateLesson = updateLesson;
const deleteLesson = async (lessonId) => {
    return prisma_1.prisma.lesson.delete({
        where: { id: lessonId },
    });
};
exports.deleteLesson = deleteLesson;
