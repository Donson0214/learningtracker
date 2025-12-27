import { Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/requireAuth";
import * as studyPlanService from "./studyPlan.service";

export const generatePlan = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { courseIds, hoursPerWeek, targetDate } = req.body;

  if (!courseIds || !hoursPerWeek || !targetDate) {
    return res.status(400).json({
      message:
        "courseIds, hoursPerWeek, and targetDate are required",
    });
  }

  const plan = await studyPlanService.createStudyPlan(
    req.user!.id,
    courseIds,
    hoursPerWeek,
    new Date(targetDate)
  );

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
  await studyPlanService.markPlanItemComplete(
    req.params.itemId,
    req.user!.id
  );

  res.json({ success: true });
};
