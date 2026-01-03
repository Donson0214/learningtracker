import { prisma } from "../../prisma";

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

const buildMonthBuckets = (months: number) => {
  const now = new Date();
  const buckets: Array<{
    key: string;
    label: string;
    start: Date;
    end: Date;
    minutes: number;
  }> = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    buckets.push({
      key: `${start.getFullYear()}-${start.getMonth()}`,
      label: monthLabels[start.getMonth()],
      start,
      end,
      minutes: 0,
    });
  }

  return buckets;
};

const toOrganizationSummary = (org: {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { users: number; courses: number };
}) => ({
  id: org.id,
  name: org.name,
  isActive: org.isActive,
  createdAt: org.createdAt,
  updatedAt: org.updatedAt,
  memberCount: org._count.users,
  courseCount: org._count.courses,
});

export const getOrganizationSummaryById = async (organizationId: string) => {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { users: true, courses: true } },
    },
  });

  if (!org) {
    return null;
  }

  const [moduleCount, lessonCount] = await Promise.all([
    prisma.module.count({
      where: { course: { organizationId } },
    }),
    prisma.lesson.count({
      where: { module: { course: { organizationId } } },
    }),
  ]);

  return {
    ...toOrganizationSummary(org),
    moduleCount,
    lessonCount,
  };
};

export const listOrganizationsPaged = async (options: {
  skip: number;
  take: number;
}) => {
  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { users: true, courses: true } },
      },
    }),
    prisma.organization.count(),
  ]);

  return {
    items: items.map(toOrganizationSummary),
    total,
  };
};

export const listOrganizationMembersPaged = async (
  organizationId: string,
  options: { skip: number; take: number }
) => {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where: { organizationId } }),
  ]);

  return {
    items,
    total,
  };
};

export const listOrganizationCoursesPaged = async (
  organizationId: string,
  options: { skip: number; take: number; includeModules: boolean }
) => {
  if (options.includeModules) {
    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        skip: options.skip,
        take: options.take,
        select: {
          id: true,
          title: true,
          description: true,
          estimatedHours: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { modules: true } },
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              lessons: {
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.course.count({ where: { organizationId } }),
    ]);

    return {
      items: items.map((course) => ({
        ...course,
        modulesCount: course._count.modules,
        modules: course.modules.map((module) => ({
          id: module.id,
          title: module.title,
          order: module.order,
          lessonsCount: module.lessons.length,
        })),
      })),
      total,
    };
  }

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
      select: {
        id: true,
        title: true,
        description: true,
        estimatedHours: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { modules: true } },
      },
    }),
    prisma.course.count({ where: { organizationId } }),
  ]);

  return {
    items: items.map((course) => ({
      ...course,
      modulesCount: course._count.modules,
    })),
    total,
  };
};

export const listMembersPaged = async (options: {
  skip: number;
  take: number;
}) => {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    items,
    total,
  };
};

export const listCoursesPaged = async (options: {
  skip: number;
  take: number;
  includeModules: boolean;
}) => {
  if (options.includeModules) {
    const [items, total] = await Promise.all([
      prisma.course.findMany({
        orderBy: { createdAt: "desc" },
        skip: options.skip,
        take: options.take,
        select: {
          id: true,
          title: true,
          description: true,
          estimatedHours: true,
          createdAt: true,
          updatedAt: true,
          organization: {
            select: {
              id: true,
              name: true,
              isActive: true,
            },
          },
          _count: { select: { modules: true } },
          modules: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              lessons: { select: { id: true } },
            },
          },
        },
      }),
      prisma.course.count(),
    ]);

    return {
      items: items.map((course) => ({
        ...course,
        modulesCount: course._count.modules,
        modules: course.modules.map((module) => ({
          id: module.id,
          title: module.title,
          order: module.order,
          lessonsCount: module.lessons.length,
        })),
      })),
      total,
    };
  }

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
      select: {
        id: true,
        title: true,
        description: true,
        estimatedHours: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: { select: { modules: true } },
      },
    }),
    prisma.course.count(),
  ]);

  return {
    items: items.map((course) => ({
      ...course,
      modulesCount: course._count.modules,
    })),
    total,
  };
};

export const setOrganizationActive = async (
  organizationId: string,
  isActive: boolean
) => {
  const existing = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { users: true, courses: true } },
    },
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.organization.update({
    where: { id: organizationId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { users: true, courses: true } },
    },
  });

  return toOrganizationSummary(updated);
};

export const getSystemAnalytics = async () => {
  const [organizations, totalLearners, totalCourses, sessionAggregate] =
    await Promise.all([
      prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
          _count: { select: { users: true, courses: true } },
        },
      }),
      prisma.user.count({ where: { role: "LEARNER" } }),
      prisma.course.count(),
      prisma.studySession.aggregate({
        _sum: { durationMinutes: true },
      }),
    ]);

  const monthBuckets = buildMonthBuckets(6);
  const earliest = monthBuckets[0]?.start ?? new Date();

  const sessions = await prisma.studySession.findMany({
    where: { studiedAt: { gte: earliest } },
    select: {
      durationMinutes: true,
      studiedAt: true,
      course: {
        select: {
          organizationId: true,
          organization: { select: { name: true } },
        },
      },
    },
  });

  sessions.forEach((session) => {
    const key = `${session.studiedAt.getFullYear()}-${session.studiedAt.getMonth()}`;
    const bucket = monthBuckets.find((entry) => entry.key === key);
    if (bucket) {
      bucket.minutes += session.durationMinutes;
    }
  });

  const minutesByOrg = new Map<
    string,
    { name: string; minutes: number }
  >();

  sessions.forEach((session) => {
    const orgId = session.course.organizationId;
    const name = session.course.organization?.name ?? "Unknown";
    const existing = minutesByOrg.get(orgId);
    minutesByOrg.set(orgId, {
      name,
      minutes: (existing?.minutes ?? 0) + session.durationMinutes,
    });
  });

  const totalOrganizations = organizations.length;
  const activeOrganizations = organizations.filter(
    (org) => org.isActive
  ).length;
  const totalStudyMinutes = sessionAggregate._sum.durationMinutes ?? 0;
  const avgStudyMinutesPerLearner = totalLearners
    ? Math.round(totalStudyMinutes / totalLearners)
    : 0;

  return {
    totals: {
      totalOrganizations,
      activeOrganizations,
      totalLearners,
      totalCourses,
      totalStudyMinutes,
      avgStudyMinutesPerLearner,
    },
    monthlyStudyMinutes: monthBuckets.map((bucket) => ({
      label: bucket.label,
      minutes: bucket.minutes,
    })),
    studyMinutesByOrganization: Array.from(minutesByOrg.entries())
      .map(([organizationId, data]) => ({
        organizationId,
        name: data.name,
        minutes: data.minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes),
    statusBreakdown: [
      { label: "Active", count: activeOrganizations },
      {
        label: "Inactive",
        count: totalOrganizations - activeOrganizations,
      },
    ],
  };
};
