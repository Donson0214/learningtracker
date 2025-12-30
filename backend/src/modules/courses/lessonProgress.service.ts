import { prisma } from "../../prisma";

export const getLessonCourseId = async (lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  return {
    lessonId: lesson.id,
    courseId: lesson.module.courseId,
  };
};

export const completeLesson = async (userId: string, lessonId: string) => {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      completedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
    },
  });
};

export const clearLessonCompletion = async (
  userId: string,
  lessonId: string
) => {
  return prisma.lessonProgress.deleteMany({
    where: { userId, lessonId },
  });
};
