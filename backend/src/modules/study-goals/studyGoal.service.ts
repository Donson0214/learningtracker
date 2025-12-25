import { prisma } from "../../prisma";

export const createStudyGoal = async (
  userId: string,
  hoursPerWeek: number,
  targetCompletionAt?: Date
) => {
  return prisma.studyGoal.create({
    data: {
      userId,
      hoursPerWeek,
      targetCompletionAt,
    },
  });
};

export const getLatestStudyGoal = async (userId: string) => {
  return prisma.studyGoal.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const updateStudyGoal = async (
  goalId: string,
  userId: string,
  data: {
    hoursPerWeek?: number;
    targetCompletionAt?: Date | null;
  }
) => {
  return prisma.studyGoal.updateMany({
    where: { id: goalId, userId },
    data,
  });
};
