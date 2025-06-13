"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerInfor: zod_1.z.object({
            name: zod_1.z.string().trim().min(1, "Customer name is required").regex(/^[\p{L}\s']+$/u, "Name must contain only letters and spaces"),
            address: zod_1.z.string().trim().min(1, "Customer address is required"),
            phone: zod_1.z.string().trim().min(6, "Customer phone must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers"),
        }),
        orderItemList: zod_1.z.array(zod_1.z.object({
            productID: zod_1.z.string().length(24, "Invalid product ID"),
            productPrice: zod_1.z.number().min(0, "Product price must be a positive number"),
            productDiscountPercentage: zod_1.z.number().min(0).max(100),
            quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
        })).min(1, "Order must include at least one item"),
        orderPaymentMethod: zod_1.z.enum(["cod"], { required_error: "Payment method is required" }),
        promotionID: zod_1.z.string().length(24, "Invalid promotion ID").optional().nullable(),
    }),
});
