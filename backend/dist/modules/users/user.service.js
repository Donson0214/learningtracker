"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserById = exports.getUserById = void 0;
const prisma_1 = require("../../prisma");
const getUserById = async (userId) => {
    return prisma_1.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true },
    });
};
exports.getUserById = getUserById;
const updateUserById = async (userId, data) => {
    return prisma_1.prisma.user.update({
        where: { id: userId },
        data,
        include: { organization: true },
    });
};
exports.updateUserById = updateUserById;
