import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { sendReminders } from "./reminder.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["ORG_ADMIN", "SYSTEM_ADMIN"]));

// manual trigger
router.post("/send", sendReminders);

export default router;
