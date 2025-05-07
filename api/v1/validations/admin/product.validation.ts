import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addProductSchema = z.object({
  body: z.object({
    productName: z.string({ required_error: "Product name is required" }).trim().min(1, "Product name cannot be empty").regex(/^(?!\d+$).*$/, "Product name cannot contain only numbers"),
    productPrice: z.number({ required_error: "Product price is required" }).nonnegative("Product price must be >= 0"),
    // productPrice: z.string(),
    categoryID: z.string({ required_error: "Category ID is required" }).regex(objectIdRegex, "Invalid category ID"),

    productStock: z.number().nonnegative().optional(),
    productDescription: z.string().trim().optional(),
    productStatus: z.enum(["active", "inactive"]).optional(),
    productPosition: z.number().int().optional(),
    productDiscountPercentage: z.number().min(0).max(100).optional(),
    productSlug: z.string().trim().min(1, "Product slug cannot be empty").optional(),
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    productName: z.string().trim().min(1, "Product name cannot be empty").regex(/^(?!\d+$).*$/, "Product name cannot contain only numbers").optional(),
    productPrice: z.number().nonnegative().optional(),
    categoryID: z.string().regex(objectIdRegex).optional(),

    productStock: z.number().nonnegative().optional(),
    productDescription: z.string().trim().optional(),
    productStatus: z.enum(["active", "inactive"]).optional(),
    productPosition: z.number().int().optional(),
    productDiscountPercentage: z.number().min(0).max(100).optional(),
    productSlug: z.string().trim().min(1).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: "Product ID is required" }).regex(objectIdRegex, "Invalid product ID"),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Product ID is required" }).regex(objectIdRegex, "Invalid product ID"),
  }),
});
