import { prisma } from "../../prisma";
import { generateStudyPlan } from "./studyPlan.generator";
export const createStudyPlan = async (
  userId: string,
  courseIds: string[],
  hoursPerWeek: number,
  endDate: Date
) => {
  const startDate = new Date();

  const lessons = await prisma.lesson.findMany({
    where: {
      module: {
        courseId: { in: courseIds },
      },
    },
    include: {
      module: true,
    },
  });

  const planItems = generateStudyPlan({
    lessons: lessons.map((l) => ({
      id: l.id,
      estimatedMinutes: l.estimatedMinutes,
      moduleId: l.moduleId,
      courseId: l.module.courseId,
    })),
    startDate,
    endDate,
    minutesPerWeek: hoursPerWeek * 60,
  });

  return prisma.studyPlan.create({
    data: {
      userId,
      startDate,
      endDate,
      items: {
        create: planItems,
      },
    },
    include: {
      items: true,
    },
  });
};

export const markPlanItemComplete = async (
  itemId: string,
  userId: string
) => {
  return prisma.studyPlanItem.updateMany({
    where: {
      id: itemId,
      studyPlan: { userId },
    },
    data: {
      isCompleted: true,
    },
  });
};

export const reschedulePlanItem = async (
  itemId: string,
  userId: string,
  scheduledDate: Date
) => {
  return prisma.studyPlanItem.updateMany({
    where: {
      id: itemId,
      studyPlan: { userId },
    },
    data: {
      scheduledDate,
    },
  });
};

export const getMyStudyPlans = async (userId: string) => {
  return prisma.studyPlan.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
};
