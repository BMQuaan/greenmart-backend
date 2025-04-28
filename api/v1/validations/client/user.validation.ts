import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    userName: z.string().trim().min(1, "User name is required").optional(),
    userPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").optional(),
    userAddress: z.string().trim().optional(),
  }),
});
