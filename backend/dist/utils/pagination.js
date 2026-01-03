"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationResponse = exports.parsePagination = void 0;
const toNumber = (value, fallback) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return fallback;
};
const clamp = (value, min, max) => {
    return Math.min(max, Math.max(min, value));
};
const parsePagination = (input, options = {}) => {
    const page = clamp(toNumber(input.page, options.page ?? 1), 1, 1_000_000);
    const pageSizeInput = input.pageSize ?? input.limit;
    const pageSize = clamp(toNumber(pageSizeInput, options.pageSize ?? 20), 1, options.maxPageSize ?? 100);
    const skip = (page - 1) * pageSize;
    return {
        page,
        pageSize,
        skip,
        take: pageSize,
    };
};
exports.parsePagination = parsePagination;
const buildPaginationResponse = (items, total, page, pageSize) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return {
        items,
        page,
        pageSize,
        total,
        totalPages,
    };
};
exports.buildPaginationResponse = buildPaginationResponse;
