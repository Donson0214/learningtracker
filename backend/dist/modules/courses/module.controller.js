"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModule = exports.updateModule = exports.listModules = exports.createModule = void 0;
const moduleService = __importStar(require("./module.service"));
const courseService = __importStar(require("./course.service"));
const realtime_1 = require("../../realtime/realtime");
const enrollment_guard_1 = require("../enrollments/enrollment.guard");
const course_schema_1 = require("../../validators/course.schema");
const validation_1 = require("../../utils/validation");
const createModule = async (req, res) => {
    const parsed = course_schema_1.createModuleSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const course = await courseService.getCourseById(req.params.courseId, req.user.organizationId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const module = await moduleService.createModule(req.params.courseId, {
        title: parsed.data.title,
        order: parsed.data.order,
    });
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "modules.changed",
            scope: { organizationId: req.user.organizationId },
        });
        (0, realtime_1.broadcast)({
            type: "courses.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.status(201).json(module);
};
exports.createModule = createModule;
const listModules = async (req, res) => {
    if (req.user?.role === "LEARNER") {
        try {
            await (0, enrollment_guard_1.ensureUserEnrolled)(req.user.id, req.params.courseId);
        }
        catch (error) {
            return res.status(403).json({ message: error.message });
        }
    }
    else {
        if (!req.user?.organizationId) {
            return res.status(404).json({ message: "No organization assigned" });
        }
        const course = await courseService.getCourseById(req.params.courseId, req.user.organizationId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
    }
    const modules = await moduleService.getModulesByCourse(req.params.courseId);
    res.json(modules);
};
exports.listModules = listModules;
const updateModule = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const existing = await moduleService.getModuleByIdForOrg(req.params.moduleId, req.user.organizationId);
    if (!existing) {
        return res.status(404).json({ message: "Module not found" });
    }
    const parsed = course_schema_1.updateModuleSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const module = await moduleService.updateModule(req.params.moduleId, parsed.data);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "modules.changed",
            scope: { organizationId: req.user.organizationId },
        });
        (0, realtime_1.broadcast)({
            type: "courses.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json(module);
};
exports.updateModule = updateModule;
const deleteModule = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const existing = await moduleService.getModuleByIdForOrg(req.params.moduleId, req.user.organizationId);
    if (!existing) {
        return res.status(404).json({ message: "Module not found" });
    }
    await moduleService.deleteModule(req.params.moduleId);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "modules.changed",
            scope: { organizationId: req.user.organizationId },
        });
        (0, realtime_1.broadcast)({
            type: "courses.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json({ success: true });
};
exports.deleteModule = deleteModule;
