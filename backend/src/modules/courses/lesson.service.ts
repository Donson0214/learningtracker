import { prisma } from "../../prisma";

export const createLesson = async (
  moduleId: string,
  data: {
    title: string;
    estimatedMinutes: number;
  }
) => {
  return prisma.lesson.create({
    data: {
      ...data,
      moduleId,
    },
  });
};

export const getLessonByIdForOrg = async (
  lessonId: string,
  organizationId: string
) => {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      module: {
        course: { organizationId },
      },
    },
  });
};

export const updateLesson = async (
  lessonId: string,
  data: {
    title?: string;
    estimatedMinutes?: number;
  }
) => {
  return prisma.lesson.update({
    where: { id: lessonId },
    data,
  });
};

export const deleteLesson = async (lessonId: string) => {
  return prisma.lesson.delete({
    where: { id: lessonId },
  });
};
