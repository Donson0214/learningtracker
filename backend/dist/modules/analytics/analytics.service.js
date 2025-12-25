"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLearnerDashboard = void 0;
const prisma_1 = require("../../prisma");
const getLearnerDashboard = async (userId) => {
    const [sessionAggregate, enrollmentCount, recentSessions, upcomingItems] = await Promise.all([
        prisma_1.prisma.studySession.aggregate({
            where: { userId },
            _sum: { durationMinutes: true },
            _count: { _all: true },
        }),
        prisma_1.prisma.enrollment.count({ where: { userId } }),
        prisma_1.prisma.studySession.findMany({
            where: { userId },
            orderBy: { studiedAt: "desc" },
            take: 5,
            include: { course: true, module: true },
        }),
        prisma_1.prisma.studyPlanItem.findMany({
            where: {
                studyPlan: { userId },
                scheduledDate: { gte: new Date() },
            },
            orderBy: { scheduledDate: "asc" },
            take: 5,
            include: { course: true, module: true },
        }),
    ]);
    return {
        totalStudyMinutes: sessionAggregate._sum.durationMinutes ?? 0,
        totalSessions: sessionAggregate._count._all,
        enrolledCourses: enrollmentCount,
        recentSessions,
        upcomingItems,
    };
};
exports.getLearnerDashboard = getLearnerDashboard;
