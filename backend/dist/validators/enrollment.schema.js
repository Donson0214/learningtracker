"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollSelfSchema = void 0;
const zod_1 = require("zod");
exports.enrollSelfSchema = zod_1.z.object({
    courseId: zod_1.z.string().trim().min(1),
});
