import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as studyGoalService from "./studyGoal.service";
import { broadcast } from "../../realtime/realtime";

export const getMyGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const goal = await studyGoalService.getLatestStudyGoal(
    req.user!.id
  );

  if (!goal) {
    return res.status(404).json({ message: "Study goal not found" });
  }

  res.json(goal);
};

export const createGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { hoursPerWeek, targetDate } = req.body;

  if (!hoursPerWeek || typeof hoursPerWeek !== "number") {
    return res.status(400).json({ message: "hoursPerWeek is required" });
  }

  let targetCompletionAt: Date | undefined = undefined;
  if (targetDate) {
    const parsedDate = new Date(targetDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "targetDate is invalid" });
    }
    targetCompletionAt = parsedDate;
  }

  const goal = await studyGoalService.createStudyGoal(
    req.user!.id,
    hoursPerWeek,
    targetCompletionAt
  );

  broadcast({
    type: "studyGoals.changed",
    scope: { userId: req.user!.id },
  });

  res.status(201).json(goal);
};

export const updateGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { hoursPerWeek, targetDate } = req.body;

  let targetCompletionAt: Date | null | undefined = undefined;
  if (targetDate !== undefined) {
    if (targetDate === null || targetDate === "") {
      targetCompletionAt = null;
    } else {
      const parsedDate = new Date(targetDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "targetDate is invalid" });
      }
      targetCompletionAt = parsedDate;
    }
  }

  const result = await studyGoalService.updateStudyGoal(
    req.params.id,
    req.user!.id,
    { hoursPerWeek, targetCompletionAt }
  );

  if (result.count === 0) {
    return res.status(404).json({ message: "Study goal not found" });
  }

  broadcast({
    type: "studyGoals.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};
