// src/modules/notifications/notification.scheduler.ts
import cron from "node-cron";
import { prisma } from "../../prisma";
import { sendPushNotification } from "./notification.service";

export const startNotificationScheduler = () => {
  // Every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("🔔 Running daily study reminder job...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items = await prisma.studyPlanItem.findMany({
      where: {
        scheduledDate: today,
        isCompleted: false,
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

      for (const token of user.deviceTokens) {
        await sendPushNotification(
          token.token,
          "📚 Study Reminder",
          `You have a study task for ${item.course.title} today`
        );
      }

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Study Reminder",
          body: `You have a study task for ${item.course.title} today`,
        },
      });
    }

    console.log(`✅ Sent ${items.length} reminders`);
  });
};
