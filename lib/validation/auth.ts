import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Enter your email address.")
    .max(254, "That email looks too long.")
    .refine(
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email address.",
    ),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(254)
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email address."),
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "The code is six digits."),
  next: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === "" ||
        /^\/admin(\/[a-z0-9/_-]+)?$/i.test(value),
      "That return path is not allowed.",
    ),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
