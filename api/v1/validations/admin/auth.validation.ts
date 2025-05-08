import { z } from "zod";

export const updateOwnProfileSchema = z.object({
  body: z.object({
    staffName: z.string().trim().min(1, "User name is required").regex(/^[\p{L}\s']+$/u, "User name must contain only letters and spaces").optional(),
    staffPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers").optional(),
    staffAddress: z.string().trim().optional(),
  }),
});
