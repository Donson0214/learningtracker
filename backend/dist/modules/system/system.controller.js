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
exports.getSystemAnalytics = exports.deleteOrganization = exports.deactivateOrganization = exports.activateOrganization = exports.listCourses = exports.listMembers = exports.listOrganizationCourses = exports.listOrganizationMembers = exports.getOrganization = exports.listOrganizations = void 0;
const pagination_1 = require("../../utils/pagination");
const realtime_1 = require("../../realtime/realtime");
const systemService = __importStar(require("./system.service"));
const orgService = __importStar(require("../organizations/organization.service"));
const notification_service_1 = require("../notifications/notification.service");
const listOrganizations = async (req, res) => {
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query, {
        pageSize: 20,
        maxPageSize: 100,
    });
    const { items, total } = await systemService.listOrganizationsPaged({
        skip,
        take,
    });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listOrganizations = listOrganizations;
const getOrganization = async (req, res) => {
    const org = await systemService.getOrganizationSummaryById(req.params.id);
    if (!org) {
        return res.status(404).json({ message: "Organization not found" });
    }
    res.json(org);
};
exports.getOrganization = getOrganization;
const listOrganizationMembers = async (req, res) => {
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query, {
        pageSize: 20,
        maxPageSize: 100,
    });
    const { items, total } = await systemService.listOrganizationMembersPaged(req.params.id, {
        skip,
        take,
    });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listOrganizationMembers = listOrganizationMembers;
const listOrganizationCourses = async (req, res) => {
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query, {
        pageSize: 20,
        maxPageSize: 100,
    });
    const includeModules = req.query.includeModules === "true";
    const { items, total } = await systemService.listOrganizationCoursesPaged(req.params.id, {
        skip,
        take,
        includeModules,
    });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listOrganizationCourses = listOrganizationCourses;
const listMembers = async (req, res) => {
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query, {
        pageSize: 20,
        maxPageSize: 100,
    });
    const { items, total } = await systemService.listMembersPaged({
        skip,
        take,
    });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listMembers = listMembers;
const listCourses = async (req, res) => {
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query, {
        pageSize: 20,
        maxPageSize: 100,
    });
    const includeModules = req.query.includeModules === "true";
    const { items, total } = await systemService.listCoursesPaged({
        skip,
        take,
        includeModules,
    });
    res.json((0, pagination_1.buildPaginationResponse)(items, total, page, pageSize));
};
exports.listCourses = listCourses;
const activateOrganization = async (req, res) => {
    const updated = await systemService.setOrganizationActive(req.params.id, true);
    if (!updated) {
        return res.status(404).json({ message: "Organization not found" });
    }
    (0, realtime_1.broadcast)({
        type: "organizations.changed",
        scope: { organizationId: updated.id },
    });
    (0, realtime_1.broadcast)({ type: "system.organizations.changed" });
    (0, realtime_1.broadcast)({ type: "system.analytics.changed" });
    res.json(updated);
};
exports.activateOrganization = activateOrganization;
const deactivateOrganization = async (req, res) => {
    const updated = await systemService.setOrganizationActive(req.params.id, false);
    if (!updated) {
        return res.status(404).json({ message: "Organization not found" });
    }
    const notifiedUserIds = await (0, notification_service_1.notifyOrganizationUsers)(updated.id, "Organization paused", "Your organization has been paused by an administrator.", {
        excludeRoles: ["ORG_ADMIN", "SYSTEM_ADMIN"],
    });
    (0, realtime_1.broadcast)({
        type: "organizations.changed",
        scope: { organizationId: updated.id },
    });
    (0, realtime_1.broadcast)({ type: "system.organizations.changed" });
    (0, realtime_1.broadcast)({ type: "system.analytics.changed" });
    notifiedUserIds.forEach((userId) => {
        (0, realtime_1.broadcast)({
            type: "notifications.changed",
            scope: { userId },
        });
    });
    res.json(updated);
};
exports.deactivateOrganization = deactivateOrganization;
const deleteOrganization = async (req, res) => {
    const organizationId = req.params.id;
    const notifiedUserIds = await (0, notification_service_1.notifyOrganizationUsers)(organizationId, "Organization deleted", "Your organization has been permanently deleted by a system administrator.", {
        excludeRoles: ["ORG_ADMIN", "SYSTEM_ADMIN"],
    });
    const deleted = await orgService.deleteOrganization(organizationId);
    if (!deleted) {
        return res.status(404).json({ message: "Organization not found" });
    }
    (0, realtime_1.broadcast)({
        type: "organizations.changed",
        scope: { organizationId },
    });
    (0, realtime_1.broadcast)({ type: "system.organizations.changed" });
    (0, realtime_1.broadcast)({ type: "system.analytics.changed" });
    (0, realtime_1.broadcast)({
        type: "users.changed",
        scope: { organizationId },
    });
    (0, realtime_1.broadcast)({
        type: "enrollments.changed",
        scope: { organizationId },
    });
    notifiedUserIds.forEach((userId) => {
        (0, realtime_1.broadcast)({
            type: "notifications.changed",
            scope: { userId },
        });
    });
    res.json({ success: true });
};
exports.deleteOrganization = deleteOrganization;
const getSystemAnalytics = async (req, res) => {
    const analytics = await systemService.getSystemAnalytics();
    res.json(analytics);
};
exports.getSystemAnalytics = getSystemAnalytics;
