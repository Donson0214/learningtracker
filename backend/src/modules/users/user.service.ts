import { prisma } from "../../prisma";

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });
};

export const updateUserById = async (
  userId: string,
  data: {
    name?: string | null;
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    include: { organization: true },
  });
};
