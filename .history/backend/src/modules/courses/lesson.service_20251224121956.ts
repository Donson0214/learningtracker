import { prisma } from "../../prisma";

export const createLesson = async (
  moduleId: string,
  data: {
    title: string;
    content?: string;
    estimatedMinutes?: number;
    order: number;
  }
) => {
  return prisma.lesson.create({
    data: {
      ...data,
      moduleId,
    },
  });
};

export const updateLesson = async (
  lessonId: string,
  data: {
    title?: string;
    content?: string;
    estimatedMinutes?: number;
    order?: number;
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
