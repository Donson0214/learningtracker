"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildValidationError = void 0;
const buildValidationError = (error) => ({
    message: "Invalid request payload",
    details: error.flatten().fieldErrors,
});
exports.buildValidationError = buildValidationError;
