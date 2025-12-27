import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";
import {
  enrollLearner,
  enrollSelf,
  unenrollSelf,
  unenrollLearner,
  myEnrollments,
  courseEnrollments,
  userEnrollments,
} from "./enrollment.controller";

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

// LEARNER
router.get("/my", myEnrollments);
router.get("/me", myEnrollments);
router.post(
  "/self",
  requireRole(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]),
  enrollSelf
);
router.delete(
  "/self/:courseId",
  requireRole(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]),
  unenrollSelf
);

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

router.get(
  "/user/:userId",
  requireRole(["ORG_ADMIN"]),
  userEnrollments
);

export default router;
