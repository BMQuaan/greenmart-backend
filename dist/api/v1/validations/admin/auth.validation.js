"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateOwnProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        staffName: zod_1.z.string().trim().min(1, "User name is required").regex(/^[\p{L}\s']+$/u, "User name must contain only letters and spaces").optional(),
        staffPhone: zod_1.z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers").optional(),
        staffAddress: zod_1.z.string().trim().optional(),
    }),
});
