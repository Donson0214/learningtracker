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
