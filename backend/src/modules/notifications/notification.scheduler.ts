import cron from "node-cron";
import { prisma } from "../../prisma";
import { sendPushNotification } from "./notification.service";
import { broadcast } from "../../realtime/realtime";

export const startNotificationScheduler = () => {
  // Every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const items = await prisma.studyPlanItem.findMany({
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
        await sendPushNotification(token.token, messageTitle, messageBody);
      }

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: messageTitle,
          body: messageBody,
        },
      });

      broadcast({
        type: "notifications.changed",
        scope: { userId: user.id },
      });
    }

  });
};
