"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNotificationScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../../prisma");
const notification_service_1 = require("./notification.service");
const realtime_1 = require("../../realtime/realtime");
const startNotificationScheduler = () => {
    // Every day at 8 AM
    node_cron_1.default.schedule("0 8 * * *", async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const items = await prisma_1.prisma.studyPlanItem.findMany({
            where: {
                scheduledDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                isCompleted: false,
                studyPlan: {
                    user: {
                        dailyReminderEnabled: true,
                    },
                },
            },
            include: {
                studyPlan: {
                    include: {
                        user: {
                            include: {
                                deviceTokens: true,
                            },
                        },
                    },
                },
                course: true,
            },
        });
        for (const item of items) {
            const user = item.studyPlan.user;
            if (!user.deviceTokens.length) {
                continue;
            }
            const messageTitle = "Study Reminder";
            const messageBody = `You have a study task for ${item.course.title} today`;
            for (const token of user.deviceTokens) {
                await (0, notification_service_1.sendPushNotification)(token.token, messageTitle, messageBody);
            }
            await prisma_1.prisma.notification.create({
                data: {
                    userId: user.id,
                    title: messageTitle,
                    body: messageBody,
                },
            });
            (0, realtime_1.broadcast)({
                type: "notifications.changed",
                scope: { userId: user.id },
            });
        }
    });
};
exports.startNotificationScheduler = startNotificationScheduler;
