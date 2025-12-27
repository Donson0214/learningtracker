import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import {
  listOrganizations,
  getOrganization,
  listOrganizationMembers,
  listOrganizationCourses,
  listMembers,
  listCourses,
  activateOrganization,
  deactivateOrganization,
  getSystemAnalytics,
} from "./system.controller";

const router = Router();

router.use(requireAuth);
router.use(requireRole(["SYSTEM_ADMIN"]));

router.get("/organizations", listOrganizations);
router.get("/organizations/:id", getOrganization);
router.get("/organizations/:id/members", listOrganizationMembers);
router.get("/organizations/:id/courses", listOrganizationCourses);
router.patch("/organizations/:id/activate", activateOrganization);
router.patch("/organizations/:id/deactivate", deactivateOrganization);
router.get("/members", listMembers);
router.get("/courses", listCourses);
router.get("/analytics", getSystemAnalytics);

export default router;
