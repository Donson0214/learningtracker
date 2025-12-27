import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";
import {
  myNotifications,
  markRead,
  updateDailyReminder,
} from "./notification.controller";
import { saveDeviceTokenHandler } from "./notification.token.controller";

const router = Router();
router.use(requireAuth);
router.use(requireActiveOrganization);

// list notifications
router.get("/me", myNotifications);

// mark read
router.post("/:id/read", markRead);

// save device token (separate controller to avoid breaking your file)
router.post("/device-token", saveDeviceTokenHandler);
router.post("/token", saveDeviceTokenHandler);

// preferences
router.patch("/preferences", updateDailyReminder);

export default router;
