import { z } from "zod";

const unicodeNameRegex = /^[\p{L}\s'-]+$/u;

export const addStaffSchema = z.object({
  body: z.object({
    staffName: z.string().trim().min(1, "Staff name is required").regex(unicodeNameRegex, "Staff name contains invalid characters"),
    staffEmail: z.string().trim().email("Invalid email format"),
    staffPassword: z.string().min(6, "Password must be at least 6 characters"),
    staffPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers"),
    staffAddress: z.string().trim().optional(),
    roleID: z.string().trim().length(24, "Invalid roleID"),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    staffName: z.string().trim().min(1, "Staff name is required").regex(unicodeNameRegex, "Staff name contains invalid characters").optional(),
    staffEmail: z.string().trim().email("Invalid email format").optional(),
    staffPassword: z.string().min(6, "Password must be at least 6 characters").optional(),
    staffPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers").optional(),
    staffAddress: z.string().trim().optional(),
    staffStatus: z.enum(["active", "inactive"]).optional(),
    roleID: z.string().trim().length(24, "Invalid roleID").optional(),
  }),
  params: z.object({
    id: z.string().trim().length(24, "Invalid staff ID")
  })
});

export const deleteStaffSchema = z.object({
  params: z.object({
    id: z.string().trim().length(24, "Invalid staff ID")
  })
});
