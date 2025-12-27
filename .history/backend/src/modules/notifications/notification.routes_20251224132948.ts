import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import * as ctrl from "./notification.controller";

const router = Router();
router.use(requireAuth);

router.get("/me", ctrl.myNotifications);
router.patch("/:id/read", ctrl.markRead);

export default router;
