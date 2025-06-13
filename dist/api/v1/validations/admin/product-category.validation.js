"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductCategorySchema = exports.updateProductCategorySchema = exports.addProductCategorySchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const unicodeNameRegex = /^[\p{L}\p{N}\s'-]+$/u;
exports.addProductCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string({ required_error: "Category name is required" }).trim().min(1, "Category name cannot be empty").regex(/^(?!\d+$).*$/, "Category name cannot contain only numbers").regex(unicodeNameRegex, "Category name contains invalid characters"),
        categoryStatus: zod_1.z.enum(["active", "inactive"], { required_error: "Category status is required" }).optional(),
        categoryPosition: zod_1.z.number().nonnegative("Product price must be >= 0").optional(),
        categorySlug: zod_1.z.string().trim().min(1, "Category slug cannot be empty").optional(),
        categoryParentID: zod_1.z.string().regex(objectIdRegex, "Invalid categoryParentID").optional(),
    }),
});
exports.updateProductCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryName: zod_1.z.string().trim().min(1).regex(/^(?!\d+$).*$/, "Category name cannot contain only numbers").regex(unicodeNameRegex, "Category name contains invalid characters").optional(),
        categoryStatus: zod_1.z.enum(["active", "inactive"]).optional(),
        categoryPosition: zod_1.z.number().nonnegative("Product price must be >= 0").optional(),
        categorySlug: zod_1.z.string().trim().min(1).optional(),
        categoryParentID: zod_1.z.string().regex(objectIdRegex).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Category ID is required" }).regex(objectIdRegex, "Invalid category ID"),
    }),
});
exports.deleteProductCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Category ID is required" }).regex(objectIdRegex, "Invalid category ID"),
    }),
});
