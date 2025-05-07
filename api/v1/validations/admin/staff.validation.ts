import { z } from "zod";

export const addStaffSchema = z.object({
  body: z.object({
    staffName: z.string().trim().min(1, "Staff name is required").regex(/^[A-Za-z\s]+$/, "Staff name cannot contain numbers"),
    staffEmail: z.string().trim().email("Invalid email format"),
    staffPassword: z.string().min(6, "Password must be at least 6 characters"),
    staffPhone: z.string().trim().min(6, "Phone number must be at least 6 digits").regex(/^\d+$/, "Phone number must contain only numbers"),
    staffAddress: z.string().trim().optional(),
    roleID: z.string().trim().length(24, "Invalid roleID"),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    staffName: z.string().trim().min(1, "Staff name is required").regex(/^[A-Za-z\s]+$/, "Staff name cannot contain numbers").optional(),
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
