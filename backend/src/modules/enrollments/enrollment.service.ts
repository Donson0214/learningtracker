import { prisma } from "../../prisma";

export const enrollUser = async (
  userId: string,
  courseId: string
) => {
  return prisma.enrollment.create({
    data: {
      userId,
      courseId,
    },
    include: {
      course: true,
    },
  });
};

export const unenrollUser = async (
  enrollmentId: string
) => {
  return prisma.enrollment.delete({
    where: { id: enrollmentId },
    include: {
      course: true,
    },
  });
};

export const getEnrollmentsForUser = async (
  userId: string
) => {
  return prisma.enrollment.findMany({
    where: { userId },
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
};

export const getEnrollmentsForCourse = async (
  courseId: string
) => {
  return prisma.enrollment.findMany({
    where: { courseId },
    include: { user: true },
  });
};

export const getEnrollmentsForUserInOrg = async (
  userId: string,
  organizationId: string
) => {
  return prisma.enrollment.findMany({
    where: {
      userId,
      course: { organizationId },
    },
    select: {
      id: true,
      userId: true,
      courseId: true,
    },
  });
};
