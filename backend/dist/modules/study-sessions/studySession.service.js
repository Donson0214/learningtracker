"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudySession = exports.updateStudySession = exports.getSessionsForUser = exports.createStudySession = void 0;
const prisma_1 = require("../../prisma");
const createStudySession = async (userId, data) => {
    return prisma_1.prisma.studySession.create({
        data: {
            userId,
            ...data,
        },
    });
};
exports.createStudySession = createStudySession;
const getSessionsForUser = async (userId) => {
    return prisma_1.prisma.studySession.findMany({
        where: { userId },
        include: {
            course: true,
            module: true,
        },
        orderBy: { studiedAt: "desc" },
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
