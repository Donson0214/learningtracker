import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as notificationService from "./notification.service";

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

  res.json({ success: true });
};
