import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import {
  enrollLearner,
  unenrollLearner,
  myEnrollments,
  courseEnrollments,
} from "./enrollment.controller";

const router = Router();

router.use(requireAuth);

// LEARNER
router.get("/me", myEnrollments);

// ORG ADMIN
router.post(
  "/",
  requireRole(["ORG_ADMIN"]),
  enrollLearner
);

router.delete(
  "/:id",
  requireRole(["ORG_ADMIN"]),
  unenrollLearner
);

router.get(
  "/course/:courseId",
  requireRole(["ORG_ADMIN"]),
  courseEnrollments
);

export default router;
