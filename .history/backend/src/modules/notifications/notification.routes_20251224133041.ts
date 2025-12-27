import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { myNotifications, markRead } from "./notification.controller";
import { saveDeviceTokenHandler } from "./notification.token.controller";

const router = Router();
router.use(requireAuth);

// list notifications
router.get("/me", myNotifications);

// mark read
router.post("/:id/read", markRead);

// save device token (separate controller to avoid breaking your file)
router.post("/device-token", saveDeviceTokenHandler);

export default router;
