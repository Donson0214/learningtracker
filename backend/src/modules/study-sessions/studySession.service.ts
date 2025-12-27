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
    include: {
      course: true,
    },
  });
};

export const getSessionById = async (
  sessionId: string,
  userId: string
) => {
  return prisma.studySession.findFirst({
    where: { id: sessionId, userId },
    include: { course: true },
  });
};

type SessionFilters = {
  courseId?: string;
  moduleId?: string;
  limit?: number;
};

export const getSessionsForUser = async (
  userId: string,
  filters: SessionFilters = {}
) => {
  const where: {
    userId: string;
    courseId?: string;
    moduleId?: string;
  } = { userId };

  if (filters.courseId) {
    where.courseId = filters.courseId;
  }
  if (filters.moduleId) {
    where.moduleId = filters.moduleId;
  }

  return prisma.studySession.findMany({
    where,
    include: {
      course: true,
      module: true,
    },
    orderBy: { studiedAt: "desc" },
    ...(filters.limit ? { take: filters.limit } : {}),
  });
};

export const updateStudySession = async (
  sessionId: string,
  userId: string,
  data: {
    durationMinutes?: number;
    notes?: string | null;
    mood?: string | null;
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
