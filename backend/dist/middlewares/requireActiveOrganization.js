"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireActiveOrganization = void 0;
const prisma_1 = require("../prisma");
const requireActiveOrganization = async (req, res, next) => {
    if (!req.user?.organizationId) {
        return next();
    }
    try {
        const org = await prisma_1.prisma.organization.findUnique({
            where: { id: req.user.organizationId },
            select: { isActive: true },
        });
        if (!org) {
            return res
                .status(404)
                .json({ message: "Organization not found", code: "ORG_NOT_FOUND" });
        }
        if (!org.isActive) {
            return res
                .status(403)
                .json({ message: "Organization is inactive", code: "ORG_INACTIVE" });
        }
        return next();
    }
    catch (error) {
        console.error("Organization status check failed:", error);
        return res
            .status(500)
            .json({ message: "Failed to verify organization status" });
    }
};
exports.requireActiveOrganization = requireActiveOrganization;
