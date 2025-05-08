import { z } from "zod";

const unicodeNameRegex = /^[\p{L}\s'-]+$/u;

export const updateUserSchema = z.object({
  body: z.object({
    userName: z.string().trim().min(1, "User name is required").regex(unicodeNameRegex, "User name contains invalid characters"),
    userPhone: z.string().trim().regex(/^\d+$/, "Phone number must contain only numbers").optional(),
    userAddress: z.string().trim().optional(),
    userStatus: z.enum(["active", "inactive"]).optional(),
  }),
  params: z.object({
    id: z.string().trim().length(24, "Invalid user ID")
  })
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().trim().length(24, "Invalid user ID")
  })
});

