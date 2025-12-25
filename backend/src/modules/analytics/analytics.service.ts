import { prisma } from "../../prisma";

export const getLearnerDashboard = async (userId: string) => {
  const [sessionAggregate, enrollmentCount, recentSessions, upcomingItems] =
    await Promise.all([
      prisma.studySession.aggregate({
        where: { userId },
        _sum: { durationMinutes: true },
        _count: { _all: true },
      }),
      prisma.enrollment.count({ where: { userId } }),
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { studiedAt: "desc" },
        take: 5,
        include: { course: true, module: true },
      }),
      prisma.studyPlanItem.findMany({
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

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const buildWeekBuckets = (weeks: number) => {
  const now = new Date();
  const buckets = [];

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    buckets.push({
      label: `Week ${weeks - i}`,
      start,
      end,
      count: 0,
      minutes: 0,
    });
  }

  return buckets;
};

const buildMonthBuckets = (months: number) => {
  const now = new Date();
  const buckets = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthLabels[date.getMonth()],
      minutes: 0,
    });
  }

  return buckets;
};

export const getOrgDashboard = async (organizationId: string) => {
  const [users, courses, sessions, enrollments, planItems, goals] =
    await Promise.all([
      prisma.user.findMany({
        where: { organizationId },
        select: { id: true, name: true, email: true, role: true },
      }),
      prisma.course.findMany({
        where: { organizationId },
        select: { id: true, title: true },
      }),
      prisma.studySession.findMany({
        where: { user: { organizationId } },
        select: {
          id: true,
          userId: true,
          courseId: true,
          durationMinutes: true,
          studiedAt: true,
          course: { select: { title: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.enrollment.findMany({
        where: { course: { organizationId } },
        select: { createdAt: true },
      }),
      prisma.studyPlanItem.findMany({
        where: { course: { organizationId } },
        select: {
          courseId: true,
          isCompleted: true,
          course: { select: { title: true } },
        },
      }),
      prisma.studyGoal.findMany({
        where: { user: { organizationId } },
        orderBy: { createdAt: "desc" },
        select: { userId: true, hoursPerWeek: true, createdAt: true },
      }),
    ]);

  const learnerCount = users.filter((u) => u.role === "LEARNER").length;
  const totalStudyMinutes = sessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0
  );
  const avgStudyMinutesPerLearner = learnerCount
    ? Math.round(totalStudyMinutes / learnerCount)
    : 0;

  const enrollmentBuckets = buildWeekBuckets(4);
  enrollments.forEach((enrollment) => {
    const bucket = enrollmentBuckets.find(
      (entry) =>
        enrollment.createdAt >= entry.start &&
        enrollment.createdAt < entry.end
    );
    if (bucket) {
      bucket.count += 1;
    }
  });

  const courseMinutes = new Map<
    string,
    { title: string; minutes: number }
  >();
  sessions.forEach((session) => {
    const existing = courseMinutes.get(session.courseId);
    const title =
      existing?.title ?? session.course?.title ?? "Untitled";
    courseMinutes.set(session.courseId, {
      title,
      minutes:
        (existing?.minutes ?? 0) + session.durationMinutes,
    });
  });

  const topLearnersMap = new Map<
    string,
    { name: string; minutes: number }
  >();
  sessions.forEach((session) => {
    const existing = topLearnersMap.get(session.userId);
    const name =
      existing?.name ??
      session.user?.name ??
      session.user?.email ??
      "Learner";
    topLearnersMap.set(session.userId, {
      name,
      minutes:
        (existing?.minutes ?? 0) + session.durationMinutes,
    });
  });

  const monthBuckets = buildMonthBuckets(6);
  sessions.forEach((session) => {
    const key = `${session.studiedAt.getFullYear()}-${session.studiedAt.getMonth()}`;
    const bucket = monthBuckets.find((entry) => entry.key === key);
    if (bucket) {
      bucket.minutes += session.durationMinutes;
    }
  });

  const completionMap = new Map<
    string,
    { title: string; total: number; completed: number }
  >();
  planItems.forEach((item) => {
    const existing = completionMap.get(item.courseId);
    const title = existing?.title ?? item.course?.title ?? "Untitled";
    completionMap.set(item.courseId, {
      title,
      total: (existing?.total ?? 0) + 1,
      completed:
        (existing?.completed ?? 0) + (item.isCompleted ? 1 : 0),
    });
  });

  const engagementWindow = new Date();
  engagementWindow.setDate(engagementWindow.getDate() - 30);
  const engagementMinutes = new Map<string, number>();
  sessions.forEach((session) => {
    if (session.studiedAt < engagementWindow) {
      return;
    }
    engagementMinutes.set(
      session.userId,
      (engagementMinutes.get(session.userId) ?? 0) +
        session.durationMinutes
    );
  });

  const engagementLevels = {
    High: 0,
    Moderate: 0,
    Low: 0,
    Inactive: 0,
  };
  users
    .filter((user) => user.role === "LEARNER")
    .forEach((user) => {
      const minutes = engagementMinutes.get(user.id) ?? 0;
      if (minutes >= 600) {
        engagementLevels.High += 1;
      } else if (minutes >= 300) {
        engagementLevels.Moderate += 1;
      } else if (minutes >= 60) {
        engagementLevels.Low += 1;
      } else {
        engagementLevels.Inactive += 1;
      }
    });

  const latestGoals = new Map<string, number>();
  goals.forEach((goal) => {
    if (!latestGoals.has(goal.userId)) {
      latestGoals.set(goal.userId, goal.hoursPerWeek);
    }
  });
  const targetMinutesPerWeek = Array.from(
    latestGoals.values()
  ).reduce((sum, hours) => sum + hours * 60, 0);

  const paceBuckets = buildWeekBuckets(4);
  sessions.forEach((session) => {
    const bucket = paceBuckets.find(
      (entry) =>
        session.studiedAt >= entry.start &&
        session.studiedAt < entry.end
    );
    if (bucket) {
      bucket.minutes += session.durationMinutes;
    }
  });

  return {
    totals: {
      totalLearners: learnerCount,
      totalCourses: courses.length,
      totalStudyMinutes,
      avgStudyMinutesPerLearner,
    },
    enrollmentTrend: enrollmentBuckets.map((bucket) => ({
      label: bucket.label,
      count: bucket.count,
    })),
    studyMinutesByCourse: Array.from(courseMinutes.entries())
      .map(([courseId, data]) => ({
        courseId,
        title: data.title,
        minutes: data.minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes),
    topLearners: Array.from(topLearnersMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        minutes: data.minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5),
    monthlyStudyMinutes: monthBuckets.map((bucket) => ({
      label: bucket.label,
      minutes: bucket.minutes,
    })),
    completionRates: Array.from(completionMap.entries()).map(
      ([courseId, data]) => ({
        courseId,
        title: data.title,
        completionRate: data.total
          ? Math.round((data.completed / data.total) * 100)
          : 0,
      })
    ),
    engagementLevels: [
      { label: "High", count: engagementLevels.High },
      { label: "Moderate", count: engagementLevels.Moderate },
      { label: "Low", count: engagementLevels.Low },
      { label: "Inactive", count: engagementLevels.Inactive },
    ],
    pace: paceBuckets.map((bucket) => ({
      label: bucket.label,
      targetMinutes: targetMinutesPerWeek,
      actualMinutes: bucket.minutes,
    })),
  };
};
