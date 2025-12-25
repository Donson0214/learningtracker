import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as notificationService from "./notification.service";
import { broadcast } from "../../realtime/realtime";

export const myNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const notifications = await notificationService.getMyNotifications(
    req.user!.id
  );

  res.json(notifications);
};

export const markRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const result = await notificationService.markAsRead(
    req.params.id,
    req.user!.id
  );

  if (result.count === 0) {
    return res.status(404).json({ message: "Notification not found" });
  }

  broadcast({
    type: "notifications.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};

export const updateDailyReminder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { enabled } = req.body;

  if (typeof enabled !== "boolean") {
    return res
      .status(400)
      .json({ message: "enabled must be boolean" });
  }

  await notificationService.updateDailyReminderPreference(
    req.user!.id,
    enabled
  );

  broadcast({
    type: "notifications.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};
