"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const prisma_1 = require("../../prisma");
const getUserById = async (userId) => {
    return prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
    });
};
exports.getUserById = getUserById;
