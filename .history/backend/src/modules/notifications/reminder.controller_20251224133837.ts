import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { sendStudyPlanReminders } from "./reminder.service";

export const sendReminders = async (
  _req: AuthenticatedRequest,
  res: Response
) => {
  const result = await sendStudyPlanReminders();
  res.json(result);
};
