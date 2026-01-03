"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const requireRole_1 = require("../../middlewares/requireRole");
const requireActiveOrganization_1 = require("../../middlewares/requireActiveOrganization");
const course_controller_1 = require("./course.controller");
const module_controller_1 = require("./module.controller");
const lesson_controller_1 = require("./lesson.controller");
const lessonProgress_controller_1 = require("./lessonProgress.controller");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
router.use(requireActiveOrganization_1.requireActiveOrganization);
// COURSES
router.post("/", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), course_controller_1.createCourse);
router.get("/", course_controller_1.listCourses);
router.get("/catalog", (0, requireRole_1.requireRole)(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]), course_controller_1.listCourseCatalog);
router.get("/:id", course_controller_1.getCourse);
router.put("/:id", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), course_controller_1.updateCourse);
router.delete("/:id", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), course_controller_1.deleteCourse);
// MODULES
router.get("/:courseId/modules", module_controller_1.listModules);
router.post("/:courseId/modules", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), module_controller_1.createModule);
router.put("/modules/:moduleId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), module_controller_1.updateModule);
router.delete("/modules/:moduleId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), module_controller_1.deleteModule);
// LESSONS
router.post("/modules/:moduleId/lessons", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), lesson_controller_1.createLesson);
router.put("/lessons/:lessonId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), lesson_controller_1.updateLesson);
router.delete("/lessons/:lessonId", (0, requireRole_1.requireRole)(["ORG_ADMIN"]), lesson_controller_1.deleteLesson);
// LESSON PROGRESS
router.post("/lessons/:lessonId/complete", (0, requireRole_1.requireRole)(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]), lessonProgress_controller_1.completeLesson);
router.delete("/lessons/:lessonId/complete", (0, requireRole_1.requireRole)(["LEARNER", "ORG_ADMIN", "SYSTEM_ADMIN"]), lessonProgress_controller_1.clearLessonCompletion);
exports.default = router;
