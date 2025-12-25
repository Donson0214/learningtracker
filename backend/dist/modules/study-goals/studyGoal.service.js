"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudyGoal = exports.getLatestStudyGoal = exports.createStudyGoal = void 0;
const prisma_1 = require("../../prisma");
const createStudyGoal = async (userId, hoursPerWeek, targetCompletionAt) => {
    return prisma_1.prisma.studyGoal.create({
        data: {
            userId,
            hoursPerWeek,
            targetCompletionAt,
        },
    });
};
exports.createStudyGoal = createStudyGoal;
const getLatestStudyGoal = async (userId) => {
    return prisma_1.prisma.studyGoal.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getLatestStudyGoal = getLatestStudyGoal;
const updateStudyGoal = async (goalId, userId, data) => {
    return prisma_1.prisma.studyGoal.updateMany({
        where: { id: goalId, userId },
        data,
    });
};
exports.updateStudyGoal = updateStudyGoal;
