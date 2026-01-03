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
exports.deleteCourse = exports.updateCourse = exports.getCourse = exports.listCourseCatalog = exports.listCourses = exports.createCourse = void 0;
const courseService = __importStar(require("./course.service"));
const realtime_1 = require("../../realtime/realtime");
const pagination_1 = require("../../utils/pagination");
const course_schema_1 = require("../../validators/course.schema");
const validation_1 = require("../../utils/validation");
const createCourse = async (req, res) => {
    const parsed = course_schema_1.createCourseSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const course = await courseService.createCourse(req.user.organizationId, parsed.data);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "courses.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.status(201).json(course);
};
exports.createCourse = createCourse;
const listCourses = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query);
    const includeModules = req.query.includeModules === "true";
    const { items, total } = req.user.role === "LEARNER"
        ? await courseService.getCoursesForLearnerPaged(req.user.id, { skip, take, includeModules })
        : await courseService.getCoursesByOrgPaged(req.user.organizationId, { skip, take, includeModules });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listCourses = listCourses;
const listCourseCatalog = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query);
    const includeModules = req.query.includeModules === "true";
    const { items, total } = await courseService.getCoursesByOrgPaged(req.user.organizationId, { skip, take, includeModules });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listCourseCatalog = listCourseCatalog;
const getCourse = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const course = req.user.role === "LEARNER"
        ? await courseService.getCourseForLearnerById(req.params.id, req.user.id)
        : await courseService.getCourseById(req.params.id, req.user.organizationId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
};
exports.getCourse = getCourse;
const updateCourse = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const parsed = course_schema_1.updateCourseSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    await courseService.updateCourse(req.params.id, req.user.organizationId, parsed.data);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "courses.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json({ success: true });
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    await courseService.deleteCourse(req.params.id, req.user.organizationId);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "courses.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json({ success: true });
};
exports.deleteCourse = deleteCourse;
