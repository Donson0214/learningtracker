import cron from "node-cron";
import { prisma } from "../../prisma";

export const startReminderScheduler = () => {
  cron.schedule("0 8 * * *", async () => {
    const plans = await prisma.studyPlan.findMany({
      include: { items: true },
    });

    // placeholder logic (can expand later)
    console.log(`⏰ Daily reminders checked: ${plans.length}`);
  });
};
