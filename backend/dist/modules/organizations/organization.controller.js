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
exports.deactivateOrg = exports.updateOrg = exports.getMyOrg = exports.createOrg = void 0;
const orgService = __importStar(require("./organization.service"));
const createOrg = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Organization name required" });
    }
    const org = await orgService.createOrganization(name, req.user.id);
    res.status(201).json(org);
};
exports.createOrg = createOrg;
const getMyOrg = async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(404).json({ message: "No organization assigned" });
    }
    const org = await orgService.getOrganizationById(req.user.organizationId);
    res.json(org);
};
exports.getMyOrg = getMyOrg;
const updateOrg = async (req, res) => {
    const { name } = req.body;
    const org = await orgService.updateOrganization(req.user.organizationId, name);
    res.json(org);
};
exports.updateOrg = updateOrg;
const deactivateOrg = async (req, res) => {
    const org = await orgService.deactivateOrganization(req.user.organizationId);
    res.json(org);
};
exports.deactivateOrg = deactivateOrg;
