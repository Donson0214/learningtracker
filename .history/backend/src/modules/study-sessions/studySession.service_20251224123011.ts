import { prisma } from "../../prisma";

export const createStudySession = async (
  userId: string,
  data: {
    courseId: string;
    moduleId?: string;
    durationMinutes: number;
    notes?: string;
    mood?: string;
    studiedAt: Date;
  }
) => {
  return prisma.studySession.create({
    data: {
      userId,
      ...data,
    },
  });
};

export const getSessionsForUser = async (userId: string) => {
  return prisma.studySession.findMany({
    where: { userId },
    include: {
      course: true,
      module: true,
    },
    orderBy: { studiedAt: "desc" },
  });
};

export const updateStudySession = async (
  sessionId: string,
  userId: string,
  data: {
    durationMinutes?: number;
    notes?: string;
    mood?: string;
    studiedAt?: Date;
  }
) => {
  return prisma.studySession.updateMany({
    where: { id: sessionId, userId },
    data,
  });
};

export const deleteStudySession = async (
  sessionId: string,
  userId: string
) => {
  return prisma.studySession.deleteMany({
    where: { id: sessionId, userId },
  });
};
