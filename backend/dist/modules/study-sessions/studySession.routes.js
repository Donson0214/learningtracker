"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../../middlewares/requireAuth");
const requireActiveOrganization_1 = require("../../middlewares/requireActiveOrganization");
const studySession_controller_1 = require("./studySession.controller");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
router.use(requireActiveOrganization_1.requireActiveOrganization);
// LEARNER ONLY
router.post("/", studySession_controller_1.createSession);
router.get("/", studySession_controller_1.listMySessions);
router.get("/me", studySession_controller_1.listMySessions);
router.put("/:id", studySession_controller_1.updateSession);
router.delete("/:id", studySession_controller_1.deleteSession);
exports.default = router;
