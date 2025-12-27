import { prisma } from "../../prisma";

export const sendStudyPlanReminders = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find incomplete study plan items scheduled for today or earlier
  const pendingItems = await prisma.studyPlanItem.findMany({
    where: {
      isCompleted: false,
      scheduledDate: {
        lte: today,
      },
    },
    include: {
      studyPlan: {
        include: {
          user: true,
        },
      },
    },
  });

  let sentCount = 0;

  for (const item of pendingItems) {
    await prisma.notification.create({
      data: {
        userId: item.studyPlan.userId,
        title: "Study Reminder",
        body: "You have a scheduled study task to complete today.",
      },
    });

    sentCount++;
  }

  return {
    totalPendingItems: pendingItems.length,
    notificationsSent: sentCount,
  };
};
