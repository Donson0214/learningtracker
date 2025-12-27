import { prisma } from "../../prisma";

// list
export const getMyNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

// mark read (order MUST be: notificationId, userId)
export const markAsRead = async (notificationId: string, userId: string) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
};

// (optional) create notification for testing/manual triggers
export const createNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  return prisma.notification.create({
    data: { userId, title, body },
  });
};

// save FCM device token
export const saveDeviceToken = async (userId: string, token: string) => {
  return prisma.deviceToken.upsert({
    where: {
      userId_token: { userId, token },
    },
    update: {},
    create: { userId, token },
  });
};
