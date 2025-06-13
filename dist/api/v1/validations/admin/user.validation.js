"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserSchema = exports.updateUserSchema = void 0;
const zod_1 = require("zod");
const unicodeNameRegex = /^[\p{L}\s'-]+$/u;
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        userName: zod_1.z.string().trim().min(1, "User name is required").regex(unicodeNameRegex, "User name contains invalid characters"),
        userPhone: zod_1.z.string().trim().regex(/^\d+$/, "Phone number must contain only numbers").optional(),
        userAddress: zod_1.z.string().trim().optional(),
        userStatus: zod_1.z.enum(["active", "inactive"]).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().trim().length(24, "Invalid user ID")
    })
});
exports.deleteUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().trim().length(24, "Invalid user ID")
    })
});
