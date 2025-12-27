import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as service from "./notification.service";

export const listMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const notifications = await service.getMyNotifications(req.user!.id);
  res.json(notifications);
};

export const markNotificationRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await service.markAsRead(req.user!.id, req.params.id);
  res.json({ success: true });
};

export const saveDeviceToken = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  await service.saveDeviceToken(req.user!.id, token);
  res.json({ success: true });
};
