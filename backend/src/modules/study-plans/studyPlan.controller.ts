import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import { ensureUserEnrolled } from "../enrollments/enrollment.guard";
import * as studyPlanService from "./studyPlan.service";
import { broadcast } from "../../realtime/realtime";

export const generatePlan = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { courseIds, hoursPerWeek, targetDate } = req.body;

  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return res.status(400).json({ message: "courseIds is required" });
  }

  if (!hoursPerWeek || typeof hoursPerWeek !== "number") {
    return res
      .status(400)
      .json({ message: "hoursPerWeek is required" });
  }

  const parsedTargetDate = new Date(targetDate);
  if (!targetDate || Number.isNaN(parsedTargetDate.getTime())) {
    return res.status(400).json({ message: "targetDate is invalid" });
  }

  try {
    for (const courseId of courseIds) {
      await ensureUserEnrolled(req.user!.id, courseId);
    }
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }

  const plan = await studyPlanService.createStudyPlan(
    req.user!.id,
    courseIds,
    hoursPerWeek,
    parsedTargetDate
  );

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
  const { scheduledDate } = req.body as { scheduledDate?: string };

  if (!scheduledDate) {
    return res.status(400).json({ message: "scheduledDate is required" });
  }

  const parsedDate = new Date(scheduledDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "scheduledDate is invalid" });
  }

  const result = await studyPlanService.reschedulePlanItem(
    req.params.itemId,
    req.user!.id,
    parsedDate
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
