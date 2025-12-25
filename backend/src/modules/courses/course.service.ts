import { prisma } from "../../prisma";

export const createCourse = async (
  organizationId: string,
  data: {
    title: string;
    description?: string;
    estimatedHours?: number;
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

export const updateCourse = async (
  courseId: string,
  organizationId: string,
  data: {
    title?: string;
    description?: string;
    estimatedHours?: number;
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
