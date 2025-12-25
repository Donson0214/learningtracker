"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyStudyPlans = exports.markPlanItemComplete = exports.createStudyPlan = void 0;
const prisma_1 = require("../../prisma");
const studyPlan_generator_1 = require("./studyPlan.generator");
const createStudyPlan = async (userId, courseIds, hoursPerWeek, endDate) => {
    const startDate = new Date();
    const lessons = await prisma_1.prisma.lesson.findMany({
        where: {
            module: {
                courseId: { in: courseIds },
            },
        },
        include: {
            module: true,
        },
    });
    const planItems = (0, studyPlan_generator_1.generateStudyPlan)({
        lessons: lessons.map((l) => ({
            id: l.id,
            estimatedMinutes: l.estimatedMinutes,
            moduleId: l.moduleId,
            courseId: l.module.courseId,
        })),
        startDate,
        endDate,
        minutesPerWeek: hoursPerWeek * 60,
    });
    return prisma_1.prisma.studyPlan.create({
        data: {
            userId,
            startDate,
            endDate,
            items: {
                create: planItems,
            },
        },
        include: {
            items: true,
        },
    });
};
exports.createStudyPlan = createStudyPlan;
const markPlanItemComplete = async (itemId, userId) => {
    return prisma_1.prisma.studyPlanItem.updateMany({
        where: {
            id: itemId,
            studyPlan: { userId },
        },
        data: {
            isCompleted: true,
        },
    });
};
exports.markPlanItemComplete = markPlanItemComplete;
const getMyStudyPlans = async (userId) => {
    return prisma_1.prisma.studyPlan.findMany({
        where: { userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });
};
exports.getMyStudyPlans = getMyStudyPlans;
