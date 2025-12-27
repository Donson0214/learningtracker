import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";
import {
  generatePlan,
  myPlans,
  completePlanItem,
  reschedulePlanItem,
} from "./studyPlan.controller";

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

router.post("/generate", generatePlan);
router.get("/me", myPlans);
router.patch("/items/:itemId/complete", completePlanItem);
router.patch("/items/:itemId/reschedule", reschedulePlanItem);

export default router;
