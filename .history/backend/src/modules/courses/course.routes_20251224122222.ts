import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import {
  createModule,
  listModules,
  updateModule,
  deleteModule,
} from "./module.controller";

import {
  createLesson,
  updateLesson,
  deleteLesson,
} from "./lesson.controller";


const router = Router();

router.use(requireAuth);

router.get("/", listCourses);
router.get("/:id", getCourse);

// MODULES
router.get("/:courseId/modules", listModules);

router.post(
  "/:courseId/modules",
  requireRole(["ORG_ADMIN"]),
  createModule
);

router.put(
  "/modules/:moduleId",
  requireRole(["ORG_ADMIN"]),
  updateModule
);

router.delete(
  "/modules/:moduleId",
  requireRole(["ORG_ADMIN"]),
  deleteModule
);

// LESSONS
router.post(
  "/modules/:moduleId/lessons",
  requireRole(["ORG_ADMIN"]),
  createLesson
);

router.put(
  "/lessons/:lessonId",
  requireRole(["ORG_ADMIN"]),
  updateLesson
);

router.delete(
  "/lessons/:lessonId",
  requireRole(["ORG_ADMIN"]),
  deleteLesson
);


export default router;
