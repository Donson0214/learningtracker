import { prisma } from "../../prisma";

export const createCourse = async (
  organizationId: string,
  data: {
    title: string;
    description?: string | null;
    estimatedHours?: number | null;
  }
) => {
  return prisma.course.create({
    data: {
      ...data,
      organizationId,
    },
  });
};

export const getCoursesByOrg = async (organizationId: string) => {
  return prisma.course.findMany({
    where: { organizationId },
    include: {
      modules: {
        include: { lessons: true },
      },
    },
  });
};

export const getCoursesByOrgPaged = async (
  organizationId: string,
  options: {
    skip: number;
    take: number;
    includeModules?: boolean;
  }
) => {
  const includeModules = Boolean(options.includeModules);
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
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
    prisma.course.count({ where: { organizationId } }),
  ]);

  const items = courses.map(({ _count, ...course }) => ({
    ...course,
    modulesCount: _count.modules,
  }));

  return { items, total };
};

export const getCoursesForLearnerPaged = async (
  userId: string,
  options: {
    skip: number;
    take: number;
    includeModules?: boolean;
  }
) => {
  const includeModules = Boolean(options.includeModules);
  const [enrollments, total] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.take,
      include: {
        course: {
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
        },
      },
    }),
    prisma.enrollment.count({ where: { userId } }),
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

export const getCourseById = async (
  courseId: string,
  organizationId: string
) => {
  return prisma.course.findFirst({
    where: { id: courseId, organizationId },
    include: {
      modules: {
        include: { lessons: true },
      },
    },
  });
};

export const getCourseForLearnerById = async (
  courseId: string,
  userId: string
) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { courseId, userId },
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: true },
          },
        },
      },
    },
  });

  return enrollment?.course ?? null;
};

export const updateCourse = async (
  courseId: string,
  organizationId: string,
  data: {
    title?: string;
    description?: string | null;
    estimatedHours?: number | null;
  }
) => {
  return prisma.course.updateMany({
    where: { id: courseId, organizationId },
    data,
  });
};

export const deleteCourse = async (
  courseId: string,
  organizationId: string
) => {
  return prisma.course.deleteMany({
    where: { id: courseId, organizationId },
  });
};
