import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    userName: z.string().trim().optional(),
    userPhone: z.string().trim().optional(),
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

