import { prisma } from "../../prisma";

const mapLessonsWithProgress = <T extends { lessonProgresses?: { completedAt: Date }[] }>(
  lessons: T[]
) =>
  lessons.map(({ lessonProgresses, ...lesson }) => ({
    ...lesson,
    isCompleted: Boolean(lessonProgresses?.length),
    completedAt: lessonProgresses?.[0]?.completedAt ?? null,
  }));

const mapCourseWithProgress = <T extends { modules?: Array<{ lessons?: { lessonProgresses?: { completedAt: Date }[] }[] }> }>(
  course: T
) => ({
  ...course,
  modules: course.modules?.map((module) => ({
    ...module,
    lessons: module.lessons ? mapLessonsWithProgress(module.lessons) : [],
  })),
});

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

export const getEnrollmentByIdForOrg = async (
  enrollmentId: string,
  organizationId: string
) => {
  return prisma.enrollment.findFirst({
    where: {
      id: enrollmentId,
      course: { organizationId },
    },
    include: { course: true },
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
            include: {
              lessons: {
                include: {
                  lessonProgresses: {
                    where: { userId },
                    select: { completedAt: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  }).then((enrollments) =>
    enrollments.map((enrollment) => ({
      ...enrollment,
      course: enrollment.course
        ? mapCourseWithProgress(enrollment.course)
        : enrollment.course,
    }))
  );
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
