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

router.post(
  "/",
  requireRole(["ORG_ADMIN"]),
  createCourse
);

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

export default router;
