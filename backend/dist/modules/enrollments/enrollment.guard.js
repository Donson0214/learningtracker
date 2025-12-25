"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUserEnrolled = void 0;
const prisma_1 = require("../../prisma");
const ensureUserEnrolled = async (userId, courseId) => {
    const enrollment = await prisma_1.prisma.enrollment.findFirst({
        where: { userId, courseId },
    });
    if (!enrollment) {
        throw new Error("User is not enrolled in this course");
    }
};
exports.ensureUserEnrolled = ensureUserEnrolled;
