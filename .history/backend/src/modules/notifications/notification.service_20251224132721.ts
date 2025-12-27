import { prisma } from "../../prisma";

export const createNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      body,
    },
  });
};

export const getMyNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markAsRead = async (userId: string, notificationId: string) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
};

export const saveDeviceToken = async (userId: string, token: string) => {
  return prisma.deviceToken.upsert({
    where: {
      userId_token: {
        userId,
        token,
      },
    },
    update: {},
    create: {
      userId,
      token,
    },
  });
};
