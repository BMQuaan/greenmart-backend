import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    customerInfor: z.object({
      name: z.string().trim().min(1, "Customer name is required").regex(/^[A-Za-z\s]+$/, "User name cannot contain numbers"),
      address: z.string().trim().min(1, "Customer address is required"),
      phone: z.string().trim().min(6, "Customer phone must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers"),
    }),
    orderItemList: z.array(
      z.object({
        productID: z.string().length(24, "Invalid product ID"),
        productPrice: z.number().min(0, "Product price must be a positive number"),
        productDiscountPercentage: z.number().min(0).max(100),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    ).min(1, "Order must include at least one item"),
    orderPaymentMethod: z.enum(["cod"], { required_error: "Payment method is required" }),
    promotionID: z.string().length(24, "Invalid promotion ID").optional().nullable(),
  }),
});
