import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { getMe, updateMe } from "./user.controller";

const router = Router();

router.use(requireAuth);
router.get("/me", getMe);
router.patch("/me", updateMe);

export default router;
