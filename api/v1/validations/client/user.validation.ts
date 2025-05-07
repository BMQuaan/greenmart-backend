import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    userName: z.string().trim().min(1, "User name is required").regex(/^[A-Za-z\s]+$/, "User name cannot contain numbers").optional(),
    userPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers").optional(),
    userAddress: z.string().trim().optional(),
  }),
});
