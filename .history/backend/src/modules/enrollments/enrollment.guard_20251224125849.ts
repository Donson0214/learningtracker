import { prisma } from "../../prisma";

export const ensureUserEnrolled = async (
  userId: string,
  courseId: string
) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, courseId },
  });

  if (!enrollment) {
    throw new Error("User is not enrolled in this course");
  }
};
