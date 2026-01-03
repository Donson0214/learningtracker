"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Organization name is required"),
});
exports.updateOrganizationSchema = exports.createOrganizationSchema;
