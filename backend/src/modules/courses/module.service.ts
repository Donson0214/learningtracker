import { prisma } from "../../prisma";

export const createModule = async (
  courseId: string,
  data: {
    title: string;
    order: number;
  }
) => {
  return prisma.module.create({
    data: {
      ...data,
      courseId,
    },
  });
};

export const getModulesByCourse = async (courseId: string) => {
  return prisma.module.findMany({
    where: { courseId },
    include: { lessons: true },
    orderBy: { order: "asc" },
  });
};

export const updateModule = async (
  moduleId: string,
  data: {
    title?: string;
    order?: number;
  }
) => {
  return prisma.module.update({
    where: { id: moduleId },
    data,
  });
};

export const deleteModule = async (moduleId: string) => {
  return prisma.module.delete({
    where: { id: moduleId },
  });
};
