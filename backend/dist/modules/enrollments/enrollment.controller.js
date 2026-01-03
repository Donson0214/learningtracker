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
exports.userEnrollments = exports.courseEnrollments = exports.myEnrollments = exports.unenrollSelf = exports.unenrollLearner = exports.enrollSelf = exports.enrollLearner = void 0;
const enrollmentService = __importStar(require("./enrollment.service"));
const realtime_1 = require("../../realtime/realtime");
const prisma_1 = require("../../prisma");
const enrollment_schema_1 = require("../../validators/enrollment.schema");
const validation_1 = require("../../utils/validation");
const enrollLearner = async (req, res) => {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        return res.status(400).json({
            message: "userId and courseId are required",
        });
    }
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const [user, course] = await Promise.all([
        prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, organizationId: true, role: true },
        }),
        prisma_1.prisma.course.findFirst({
            where: { id: courseId, organizationId: req.user.organizationId },
            select: { id: true, organizationId: true },
        }),
    ]);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    if (user.organizationId !== req.user.organizationId) {
        return res
            .status(403)
            .json({ message: "User is not in your organization" });
    }
    if (user.role !== "LEARNER") {
        return res
            .status(400)
            .json({ message: "Only learners can be enrolled" });
    }
    const enrollment = await enrollmentService.enrollUser(userId, courseId);
    if (enrollment.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "enrollments.changed",
            scope: { organizationId: enrollment.course.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "enrollments.changed",
        scope: { userId },
    });
    if (enrollment.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: enrollment.course.organizationId },
        });
    }
    res.status(201).json(enrollment);
};
exports.enrollLearner = enrollLearner;
const enrollSelf = async (req, res) => {
    const parsed = enrollment_schema_1.enrollSelfSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const course = await prisma_1.prisma.course.findFirst({
        where: {
            id: parsed.data.courseId,
            organizationId: req.user.organizationId,
        },
        select: { id: true, organizationId: true },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const existing = await prisma_1.prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: req.user.id,
                courseId: course.id,
            },
        },
        select: { id: true },
    });
    if (existing) {
        return res.status(409).json({ message: "Already enrolled" });
    }
    const enrollment = await enrollmentService.enrollUser(req.user.id, course.id);
    if (enrollment.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "enrollments.changed",
            scope: { organizationId: enrollment.course.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "enrollments.changed",
        scope: { userId: req.user.id },
    });
    if (enrollment.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: enrollment.course.organizationId },
        });
    }
    res.status(201).json(enrollment);
};
exports.enrollSelf = enrollSelf;
const unenrollLearner = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const existing = await enrollmentService.getEnrollmentByIdForOrg(req.params.id, req.user.organizationId);
    if (!existing) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    const enrollment = await enrollmentService.unenrollUser(req.params.id);
    if (enrollment.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "enrollments.changed",
            scope: { organizationId: enrollment.course.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "enrollments.changed",
        scope: { userId: enrollment.userId },
    });
    if (enrollment.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: enrollment.course.organizationId },
        });
    }
    res.json({ success: true });
};
exports.unenrollLearner = unenrollLearner;
const unenrollSelf = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const courseId = req.params.courseId;
    if (!courseId) {
        return res.status(400).json({ message: "courseId is required" });
    }
    const enrollment = await prisma_1.prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: req.user.id,
                courseId,
            },
        },
        include: { course: true },
    });
    if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
    }
    const deleted = await enrollmentService.unenrollUser(enrollment.id);
    if (deleted.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "enrollments.changed",
            scope: { organizationId: deleted.course.organizationId },
        });
    }
    (0, realtime_1.broadcast)({
        type: "enrollments.changed",
        scope: { userId: req.user.id },
    });
    if (deleted.course?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "analytics.changed",
            scope: { organizationId: deleted.course.organizationId },
        });
    }
    res.json({ success: true });
};
exports.unenrollSelf = unenrollSelf;
const myEnrollments = async (req, res) => {
    const enrollments = await enrollmentService.getEnrollmentsForUser(req.user.id);
    res.json(enrollments);
};
exports.myEnrollments = myEnrollments;
const courseEnrollments = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const course = await prisma_1.prisma.course.findFirst({
        where: { id: req.params.courseId, organizationId: req.user.organizationId },
        select: { id: true },
    });
    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }
    const enrollments = await enrollmentService.getEnrollmentsForCourse(req.params.courseId);
    res.json(enrollments);
};
exports.courseEnrollments = courseEnrollments;
const userEnrollments = async (req, res) => {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const enrollments = await enrollmentService.getEnrollmentsForUserInOrg(req.params.userId, organizationId);
    res.json(enrollments);
};
exports.userEnrollments = userEnrollments;
