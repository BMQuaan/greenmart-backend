"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaffSchema = exports.updateStaffSchema = exports.addStaffSchema = void 0;
const zod_1 = require("zod");
const unicodeNameRegex = /^[\p{L}\s'-]+$/u;
exports.addStaffSchema = zod_1.z.object({
    body: zod_1.z.object({
        staffName: zod_1.z.string().trim().min(1, "Staff name is required").regex(unicodeNameRegex, "Staff name contains invalid characters"),
        staffEmail: zod_1.z.string().trim().email("Invalid email format"),
        staffPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
        staffPhone: zod_1.z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers"),
        staffAddress: zod_1.z.string().trim().optional(),
        roleID: zod_1.z.string().trim().length(24, "Invalid roleID"),
    }),
});
exports.updateStaffSchema = zod_1.z.object({
    body: zod_1.z.object({
        staffName: zod_1.z.string().trim().min(1, "Staff name is required").regex(unicodeNameRegex, "Staff name contains invalid characters").optional(),
        staffEmail: zod_1.z.string().trim().email("Invalid email format").optional(),
        staffPassword: zod_1.z.string().min(6, "Password must be at least 6 characters").optional(),
        staffPhone: zod_1.z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers").optional(),
        staffAddress: zod_1.z.string().trim().optional(),
        staffStatus: zod_1.z.enum(["active", "inactive"]).optional(),
        roleID: zod_1.z.string().trim().length(24, "Invalid roleID").optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().trim().length(24, "Invalid staff ID")
    })
});
exports.deleteStaffSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().trim().length(24, "Invalid staff ID")
    })
});
