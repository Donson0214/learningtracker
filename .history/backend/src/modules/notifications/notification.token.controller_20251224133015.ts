import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as notificationService from "./notification.service";

export const saveDeviceTokenHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "token is required" });
  }

  await notificationService.saveDeviceToken(req.user!.id, token);
  res.json({ success: true });
};
