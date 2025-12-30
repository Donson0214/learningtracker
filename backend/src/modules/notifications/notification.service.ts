import type { UserRole } from "@prisma/client";
import { prisma } from "../../prisma";
import { firebaseAdmin } from "../../config/firebase";

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

type NotifyOptions = {
  excludeRoles?: UserRole[];
  excludeUserIds?: string[];
};

export const notifyOrganizationUsers = async (
  organizationId: string,
  title: string,
  body: string,
  options: NotifyOptions = {}
) => {
  const filters: {
    organizationId: string;
    role?: { notIn: UserRole[] };
    id?: { notIn: string[] };
  } = { organizationId };

  if (options.excludeRoles?.length) {
    filters.role = { notIn: options.excludeRoles };
  }

  if (options.excludeUserIds?.length) {
    filters.id = { notIn: options.excludeUserIds };
  }

  const users = await prisma.user.findMany({
    where: filters,
    select: { id: true },
  });

  if (!users.length) {
    return [];
  }

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title,
      body,
    })),
  });

  return users.map((user) => user.id);
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

export const sendPushNotification = async (
  token: string,
  title: string,
  body: string
) => {
  return firebaseAdmin.messaging().send({
    token,
    notification: { title, body },
  });
};

export const updateDailyReminderPreference = async (
  userId: string,
  enabled: boolean
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { dailyReminderEnabled: enabled },
  });
};
