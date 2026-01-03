"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDailyReminderPreference = exports.sendPushNotification = exports.saveDeviceToken = exports.notifyOrganizationUsers = exports.createNotification = exports.markAsRead = exports.getMyNotifications = void 0;
const prisma_1 = require("../../prisma");
const firebase_1 = require("../../config/firebase");
// list
const getMyNotifications = async (userId) => {
    return prisma_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
exports.getMyNotifications = getMyNotifications;
// mark read (order MUST be: notificationId, userId)
const markAsRead = async (notificationId, userId) => {
    return prisma_1.prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
    });
};
exports.markAsRead = markAsRead;
// (optional) create notification for testing/manual triggers
const createNotification = async (userId, title, body) => {
    return prisma_1.prisma.notification.create({
        data: { userId, title, body },
    });
};
exports.createNotification = createNotification;
const notifyOrganizationUsers = async (organizationId, title, body, options = {}) => {
    const filters = { organizationId };
    if (options.excludeRoles?.length) {
        filters.role = { notIn: options.excludeRoles };
    }
    if (options.excludeUserIds?.length) {
        filters.id = { notIn: options.excludeUserIds };
    }
    const users = await prisma_1.prisma.user.findMany({
        where: filters,
        select: { id: true },
    });
    if (!users.length) {
        return [];
    }
    await prisma_1.prisma.notification.createMany({
        data: users.map((user) => ({
            userId: user.id,
            title,
            body,
        })),
    });
    return users.map((user) => user.id);
};
exports.notifyOrganizationUsers = notifyOrganizationUsers;
// save FCM device token
const saveDeviceToken = async (userId, token) => {
    return prisma_1.prisma.deviceToken.upsert({
        where: {
            userId_token: { userId, token },
        },
        update: {},
        create: { userId, token },
    });
};
exports.saveDeviceToken = saveDeviceToken;
const sendPushNotification = async (token, title, body) => {
    return firebase_1.firebaseAdmin.messaging().send({
        token,
        notification: { title, body },
    });
};
exports.sendPushNotification = sendPushNotification;
const updateDailyReminderPreference = async (userId, enabled) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data: { dailyReminderEnabled: enabled },
    });
};
exports.updateDailyReminderPreference = updateDailyReminderPreference;
