import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { ensureUserEnrolled } from "../enrollments/enrollment.guard";
import * as studyPlanService from "./studyPlan.service";
import { broadcast } from "../../realtime/realtime";
import {
  generateStudyPlanSchema,
  rescheduleStudyPlanItemSchema,
} from "../../validators/studyPlan.schema";
import { buildValidationError } from "../../utils/validation";

export const generatePlan = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = generateStudyPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }
  const { courseIds, hoursPerWeek, targetDate } = parsed.data;
  const parsedTargetDate = new Date(targetDate);
  parsedTargetDate.setHours(23, 59, 59, 999);

  if (Number.isNaN(parsedTargetDate.getTime())) {
    return res.status(400).json({ message: "Invalid target date" });
  }

  if (parsedTargetDate < new Date()) {
    return res
      .status(400)
      .json({ message: "Target date must be today or later" });
  }

  try {
    for (const courseId of courseIds) {
      await ensureUserEnrolled(req.user!.id, courseId);
    }
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }

  let plan;
  try {
    plan = await studyPlanService.createStudyPlan(
      req.user!.id,
      courseIds,
      hoursPerWeek,
      parsedTargetDate
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate study plan";
    return res.status(400).json({ message });
  }

  broadcast({
    type: "studyPlans.changed",
    scope: { userId: req.user!.id },
  });

  res.status(201).json(plan);
};

export const myPlans = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const plans = await studyPlanService.getMyStudyPlans(
    req.user!.id
  );

  res.json(plans);
};

export const completePlanItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const result = await studyPlanService.markPlanItemComplete(
    req.params.itemId,
    req.user!.id
  );

  if (result.count === 0) {
    return res.status(404).json({ message: "Plan item not found" });
  }

  broadcast({
    type: "studyPlanItems.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};

export const reschedulePlanItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const parsed = rescheduleStudyPlanItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildValidationError(parsed.error));
  }

  const result = await studyPlanService.reschedulePlanItem(
    req.params.itemId,
    req.user!.id,
    new Date(parsed.data.scheduledDate)
  );

  if (result.count === 0) {
    return res.status(404).json({ message: "Plan item not found" });
  }

  broadcast({
    type: "studyPlanItems.changed",
    scope: { userId: req.user!.id },
  });

  res.json({ success: true });
};
