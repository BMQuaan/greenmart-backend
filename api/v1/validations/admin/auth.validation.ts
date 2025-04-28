import { z } from "zod";

export const updateOwnProfileSchema = z.object({
  body: z.object({
    staffName: z.string().trim().min(1, "Staff name is required").optional(),
    staffPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").optional(),
    staffAddress: z.string().trim().optional(),
  }),
});
