"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductSchema = exports.updateProductSchema = exports.addProductSchema = void 0;
const zod_1 = require("zod");
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const unicodeNameRegex = /^[\p{L}\p{N}\s'-]+$/u;
exports.addProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        productName: zod_1.z.string({ required_error: "Product name is required" }).trim().min(1, "Product name cannot be empty").regex(/^(?!\d+$).*$/, "Product name cannot contain only numbers").regex(unicodeNameRegex, "Product name contains invalid characters"),
        productPrice: zod_1.z.number({ required_error: "Product price is required" }).nonnegative("Product price must be >= 0"),
        categoryID: zod_1.z.string({ required_error: "Category ID is required" }).regex(objectIdRegex, "Invalid category ID"),
        productStock: zod_1.z.number().nonnegative().optional(),
        productDescription: zod_1.z.string().trim().optional(),
        productStatus: zod_1.z.enum(["active", "inactive"]).optional(),
        productPosition: zod_1.z.number().int().optional(),
        productDiscountPercentage: zod_1.z.number().min(0).max(100).optional(),
        productSlug: zod_1.z.string().trim().min(1, "Product slug cannot be empty").optional(),
    })
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        productName: zod_1.z.string().trim().min(1, "Product name cannot be empty").regex(/^(?!\d+$).*$/, "Product name cannot contain only numbers").regex(unicodeNameRegex, "Product name contains invalid characters").optional(),
        productPrice: zod_1.z.number().nonnegative().optional(),
        categoryID: zod_1.z.string().regex(objectIdRegex).optional(),
        productStock: zod_1.z.number().nonnegative().optional(),
        productDescription: zod_1.z.string().trim().optional(),
        productStatus: zod_1.z.enum(["active", "inactive"]).optional(),
        productPosition: zod_1.z.number().int().optional(),
        productDiscountPercentage: zod_1.z.number().min(0).max(100).optional(),
        productSlug: zod_1.z.string().trim().min(1).optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Product ID is required" }).regex(objectIdRegex, "Invalid product ID"),
    }),
});
exports.deleteProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: "Product ID is required" }).regex(objectIdRegex, "Invalid product ID"),
    }),
});
