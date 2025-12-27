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
  });
};

export const unenrollUser = async (
  enrollmentId: string
) => {
  return prisma.enrollment.delete({
    where: { id: enrollmentId },
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
