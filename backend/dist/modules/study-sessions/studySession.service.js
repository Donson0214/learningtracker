"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudySession = exports.updateStudySession = exports.getSessionsForUser = exports.getSessionById = exports.createStudySession = void 0;
const prisma_1 = require("../../prisma");
const createStudySession = async (userId, data) => {
    return prisma_1.prisma.studySession.create({
        data: {
            userId,
            ...data,
        },
        include: {
            course: true,
        },
    });
};
exports.createStudySession = createStudySession;
const getSessionById = async (sessionId, userId) => {
    return prisma_1.prisma.studySession.findFirst({
        where: { id: sessionId, userId },
        include: { course: true },
    });
};
exports.getSessionById = getSessionById;
const getSessionsForUser = async (userId, filters = {}) => {
    const where = { userId };
    if (filters.courseId) {
        where.courseId = filters.courseId;
    }
    if (filters.moduleId) {
        where.moduleId = filters.moduleId;
    }
    return prisma_1.prisma.studySession.findMany({
        where,
        include: {
            course: true,
            module: true,
        },
        orderBy: { studiedAt: "desc" },
        ...(filters.limit ? { take: filters.limit } : {}),
    });
};
exports.getSessionsForUser = getSessionsForUser;
const updateStudySession = async (sessionId, userId, data) => {
    return prisma_1.prisma.studySession.updateMany({
        where: { id: sessionId, userId },
        data,
    });
};
exports.updateStudySession = updateStudySession;
const deleteStudySession = async (sessionId, userId) => {
    return prisma_1.prisma.studySession.deleteMany({
        where: { id: sessionId, userId },
    });
};
exports.deleteStudySession = deleteStudySession;
