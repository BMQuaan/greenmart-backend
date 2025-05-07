import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addProductCategorySchema = z.object({
  body: z.object({
    categoryName: z.string({ required_error: "Category name is required" }).trim().min(1, "Category name cannot be empty").regex(/^(?!\d+$).*$/, "Category name cannot contain only numbers"),

    categoryStatus: z.enum(["active", "inactive"], { required_error: "Category status is required" }).optional(),
    categoryPosition: z.number().nonnegative("Product price must be >= 0").optional(),
    categorySlug: z.string().trim().min(1, "Category slug cannot be empty").optional(),
    categoryParentID: z.string().regex(objectIdRegex, "Invalid categoryParentID").optional(),
  }),
});

export const updateProductCategorySchema = z.object({
  body: z.object({
    categoryName: z.string().trim().min(1).regex(/^(?!\d+$).*$/, "Category name cannot contain only numbers").optional(),
    categoryStatus: z.enum(["active", "inactive"]).optional(),
    categoryPosition: z.number().nonnegative("Product price must be >= 0").optional(),
    categorySlug: z.string().trim().min(1).optional(),
    categoryParentID: z.string().regex(objectIdRegex).optional(),
  }),
  params: z.object({
    id: z.string({ required_error: "Category ID is required" }).regex(objectIdRegex, "Invalid category ID"),
  }),
});

export const deleteProductCategorySchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Category ID is required" }).regex(objectIdRegex, "Invalid category ID"),
  }),
});
