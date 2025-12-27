import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  generatePlan,
  myPlans,
  completePlanItem,
} from "./studyPlan.controller";

const router = Router();

router.use(requireAuth);

router.post("/generate", generatePlan);
router.get("/me", myPlans);
router.patch("/items/:itemId/complete", completePlanItem);

export default router;
