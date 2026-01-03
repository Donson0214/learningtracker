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
exports.removeOrgMember = exports.activateOrg = exports.deleteOrg = exports.deactivateOrg = exports.updateOrg = exports.getMyOrgMembers = exports.getMyOrg = exports.createOrg = void 0;
const orgService = __importStar(require("./organization.service"));
const realtime_1 = require("../../realtime/realtime");
const pagination_1 = require("../../utils/pagination");
const organization_schema_1 = require("../../validators/organization.schema");
const validation_1 = require("../../utils/validation");
const notification_service_1 = require("../notifications/notification.service");
const createOrg = async (req, res) => {
    const parsed = organization_schema_1.createOrganizationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    const { name } = parsed.data;
    if (req.user?.organizationId) {
        const existingOrg = await orgService.getOrganizationById(req.user.organizationId);
        if (existingOrg?.isActive) {
            return res
                .status(409)
                .json({ message: "Organization already assigned" });
        }
    }
    const nextRole = req.user?.role === "LEARNER" ? "ORG_ADMIN" : req.user.role;
    const result = await orgService.createOrganization(name, req.user.id, nextRole);
    const org = await orgService.getOrganizationById(result.organization.id);
    (0, realtime_1.broadcast)({
        type: "organizations.changed",
        scope: { userId: req.user.id, organizationId: result.organization.id },
    });
    (0, realtime_1.broadcast)({
        type: "users.changed",
        scope: { userId: req.user.id },
    });
    res.status(201).json(org ?? result.organization);
};
exports.createOrg = createOrg;
const getMyOrg = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const org = await orgService.getOrganizationById(req.user.organizationId);
    if (!org) {
        return res.status(404).json({ message: "Organization not found" });
    }
    res.json(org);
};
exports.getMyOrg = getMyOrg;
const getMyOrgMembers = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const { page, pageSize, skip, take } = (0, pagination_1.parsePagination)(req.query, {
        pageSize: 20,
        maxPageSize: 100,
    });
    const { items, total, summary } = await orgService.getOrganizationMembersPaged(req.user.organizationId, { skip, take });
    res.json({
        ...(0, pagination_1.buildPaginationResponse)(items, total, page, pageSize),
        summary,
    });
};
exports.getMyOrgMembers = getMyOrgMembers;
const updateOrg = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const parsed = organization_schema_1.updateOrganizationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, validation_1.buildValidationError)(parsed.error));
    }
    await orgService.updateOrganization(req.user.organizationId, parsed.data.name);
    const org = await orgService.getOrganizationById(req.user.organizationId);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "organizations.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json(org);
};
exports.updateOrg = updateOrg;
const deactivateOrg = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    await orgService.deactivateOrganization(req.user.organizationId);
    const notifiedUserIds = await (0, notification_service_1.notifyOrganizationUsers)(req.user.organizationId, "Organization paused", "Your organization has been paused by an administrator.", {
        excludeRoles: ["ORG_ADMIN", "SYSTEM_ADMIN"],
    });
    const org = await orgService.getOrganizationById(req.user.organizationId);
    if (req.user?.organizationId) {
        (0, realtime_1.broadcast)({
            type: "organizations.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    notifiedUserIds.forEach((userId) => {
        (0, realtime_1.broadcast)({
            type: "notifications.changed",
            scope: { userId },
        });
    });
    res.json(org);
};
exports.deactivateOrg = deactivateOrg;
const deleteOrg = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const organizationId = req.user.organizationId;
    const notifiedUserIds = await (0, notification_service_1.notifyOrganizationUsers)(organizationId, "Organization deleted", "Your organization has been permanently deleted by an administrator.", {
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
exports.deleteOrg = deleteOrg;
const activateOrg = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    await orgService.activateOrganization(req.user.organizationId);
    const org = await orgService.getOrganizationById(req.user.organizationId);
    if (req.user.organizationId) {
        (0, realtime_1.broadcast)({
            type: "organizations.changed",
            scope: { organizationId: req.user.organizationId },
        });
    }
    res.json(org);
};
exports.activateOrg = activateOrg;
const removeOrgMember = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    if (req.user.id === req.params.memberId) {
        return res.status(400).json({ message: "You cannot remove yourself" });
    }
    const result = await orgService.removeOrganizationMember(req.user.organizationId, req.params.memberId);
    if (result.status === "not_found") {
        return res.status(404).json({ message: "Member not found" });
    }
    if (result.status === "forbidden") {
        if (result.reason === "system_admin") {
            return res.status(403).json({ message: "Cannot remove system admin" });
        }
        return res.status(409).json({ message: "Cannot remove last admin" });
    }
    (0, realtime_1.broadcast)({
        type: "users.changed",
        scope: { organizationId: req.user.organizationId },
    });
    (0, realtime_1.broadcast)({
        type: "enrollments.changed",
        scope: { organizationId: req.user.organizationId },
    });
    (0, realtime_1.broadcast)({
        type: "organizations.changed",
        scope: { organizationId: req.user.organizationId },
    });
    res.json({ success: true });
};
exports.removeOrgMember = removeOrgMember;
