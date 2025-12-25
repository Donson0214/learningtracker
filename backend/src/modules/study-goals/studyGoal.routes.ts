import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { createGoal, getMyGoal, updateGoal } from "./studyGoal.controller";

const router = Router();

router.use(requireAuth);
router.get("/me", getMyGoal);
router.post("/", createGoal);
router.put("/:id", updateGoal);

export default router;
