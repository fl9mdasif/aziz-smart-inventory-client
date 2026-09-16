import { z } from "zod";

// Mirrors aziz-server/src/app/modules/auth/validation.auth.ts exactly
export const UserRegSchema = z.object({
  username: z.string().min(1).max(50, "Username is required!"),
  email: z.string().email("Valid email is required!"),
  password: z.string().min(6, "Must be at least 6 characters").max(30),
  role: z.enum(["staff", "admin", "superAdmin"]).default("staff"),
  contactNumber: z.string({ message: "Contact number is required!" }),
  profilePicture: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address!"),
  password: z.string().min(6, "Must be at least 6 characters"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string({ message: "Current password is required" }),
  newPassword: z.string().min(6, "Must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  contactNumber: z.string().optional(),
  profilePicture: z.string().optional(),
});
