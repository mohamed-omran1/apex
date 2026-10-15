import { z } from "zod";

const digitCount = (value: string) => value.replace(/\D/g, "").length;

/** Same rule as the public lead phone field: 10 to 15 digits. */
const phoneField = z
  .string()
  .trim()
  .refine(
    (value) => digitCount(value) >= 10 && digitCount(value) <= 15,
    "Add a phone number with at least 10 digits.",
  );

const dateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.");

/**
 * Partial by design: the sidebar emergency toggle sends only
 * emergency_mode, and the settings page may send any subset. Only the
 * keys present in the input are written.
 */
export const settingsPatchSchema = z
  .object({
    phone: phoneField.optional(),
    emergency_mode: z
      .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("on")])
      .transform((value) => value === true || value === "true" || value === "on")
      .optional(),
    emergency_banner: z.string().trim().max(300, "Keep the banner under 300 characters.").optional(),
    business_hours: z.record(z.string(), z.string().max(120)).optional(),
  })
  .refine(
    (value) =>
      value.phone !== undefined ||
      value.emergency_mode !== undefined ||
      value.emergency_banner !== undefined ||
      value.business_hours !== undefined,
    "Nothing to save.",
  );

export const offerSchema = z.object({
  title: z.string().trim().min(2, "Give the offer a title.").max(120, "Keep the title under 120 characters."),
  body: z.string().trim().min(2, "Give the offer a line of copy.").max(300, "Keep the copy under 300 characters."),
  starts_on: dateField,
  ends_on: dateField,
  is_active: z
    .union([z.boolean(), z.literal("true"), z.literal("false"), z.literal("on")])
    .transform((value) => value === true || value === "true" || value === "on"),
});

export type SettingsPatch = z.infer<typeof settingsPatchSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
