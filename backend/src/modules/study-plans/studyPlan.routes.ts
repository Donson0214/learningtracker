import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  generatePlan,
  myPlans,
  completePlanItem,
  reschedulePlanItem,
} from "./studyPlan.controller";

const router = Router();

router.use(requireAuth);

router.post("/generate", generatePlan);
router.get("/me", myPlans);
router.patch("/items/:itemId/complete", completePlanItem);
router.patch("/items/:itemId/reschedule", reschedulePlanItem);

export default router;
