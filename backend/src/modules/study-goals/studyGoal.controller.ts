import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as studyGoalService from "./studyGoal.service";
import { broadcast } from "../../realtime/realtime";
import {
  createStudyGoalSchema,
  updateStudyGoalSchema,
} from "../../validators/studyGoal.schema";
import { buildValidationError } from "../../utils/validation";

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
  const parsed = createStudyGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  const targetCompletionAt = parsed.data.targetDate
    ? new Date(parsed.data.targetDate)
    : undefined;

  const goal = await studyGoalService.createStudyGoal(
    req.user!.id,
    parsed.data.hoursPerWeek,
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
  const parsed = updateStudyGoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  const targetCompletionAt =
    parsed.data.targetDate === null
      ? null
      : parsed.data.targetDate
        ? new Date(parsed.data.targetDate)
        : undefined;

  const result = await studyGoalService.updateStudyGoal(
    req.params.id,
    req.user!.id,
    {
      hoursPerWeek: parsed.data.hoursPerWeek,
      targetCompletionAt,
    }
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
