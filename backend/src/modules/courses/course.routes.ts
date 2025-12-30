import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { requireRole } from "../../middlewares/requireRole";
import { requireActiveOrganization } from "../../middlewares/requireActiveOrganization";

import {
  createCourse,
  listCourses,
  listCourseCatalog,
  getCourse,
  updateCourse,
  deleteCourse,
} from "./course.controller";

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
import {
  completeLesson,
  clearLessonCompletion,
} from "./lessonProgress.controller";

const router = Router();

router.use(requireAuth);
router.use(requireActiveOrganization);

// COURSES
router.post(
  "/",
  requireRole(["ORG_ADMIN"]),
  createCourse
);
router.get("/", listCourses);
router.get(
  "/catalog",
  requireRole(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]),
  listCourseCatalog
);
router.get("/:id", getCourse);
router.put(
  "/:id",
  requireRole(["ORG_ADMIN"]),
  updateCourse
);
router.delete(
  "/:id",
  requireRole(["ORG_ADMIN"]),
  deleteCourse
);

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

// LESSON PROGRESS
router.post(
  "/lessons/:lessonId/complete",
  requireRole(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]),
  completeLesson
);

router.delete(
  "/lessons/:lessonId/complete",
  requireRole(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]),
  clearLessonCompletion
);

export default router;
