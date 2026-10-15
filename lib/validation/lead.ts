import { z } from "zod";

export const leadKinds = [
  "emergency",
  "repair",
  "estimate",
  "tune_up",
  "membership_enquiry",
] as const;

export const preferredWindows = [
  "asap",
  "morning",
  "afternoon",
  "evening",
] as const;

export type LeadKind = (typeof leadKinds)[number];
export type PreferredWindow = (typeof preferredWindows)[number];

const digitCount = (value: string) => value.replace(/\D/g, "").length;

const phoneField = z
  .string()
  .trim()
  .refine(
    (value) => digitCount(value) >= 10 && digitCount(value) <= 15,
    "Add a phone number so the owner can call you back.",
  );

const consentField = z
  .union([z.boolean(), z.literal("on"), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "on" || value === "true");

const optionalDay = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid day.")
  .refine(
    (value) => value >= new Date().toISOString().slice(0, 10),
    "Pick today or a later day.",
  );

const baseFields = {
  name: z.string().trim().min(2, "Name is required."),
  phone: phoneField,
  zip: z.string().trim().regex(/^\d{5}$/, "ZIP must be 5 digits."),
  email: z
    .string()
    .trim()
    .max(254, "That email looks too long.")
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Enter a valid email address.",
    ),
  issue: z.string().trim().max(2000, "Keep the description under 2000 characters."),
  address: z.string().trim().max(400, "Keep the address under 400 characters."),
  preferred_day: optionalDay.optional().or(z.literal("")),
  company: z.string().optional(),
  consent_email: consentField,
  consent_sms: consentField,
  utm_source: z.string().trim().max(120).optional().or(z.literal("")),
  utm_medium: z.string().trim().max(120).optional().or(z.literal("")),
  utm_campaign: z.string().trim().max(120).optional().or(z.literal("")),
};

const emergencySchema = z.object({
  ...baseFields,
  kind: z.literal("emergency"),
  issue: baseFields.issue.min(2, "Tell us what is going on."),
  email: z.literal(""),
  address: z.literal(""),
  preferred_day: z.literal(""),
  preferred_window: z.literal(""),
});

const estimateSchema = z.object({
  ...baseFields,
  kind: z.literal("estimate"),
  address: baseFields.address.min(5, "Address is needed for an in-home estimate."),
  preferred_window: z.enum(preferredWindows, "Pick a window."),
});

const visitKind = <T extends string>(...kinds: T[]) =>
  z.object({
    ...baseFields,
    kind: z.enum(kinds as [T, ...T[]]),
    preferred_window: z.enum(preferredWindows, "Pick a window."),
  });

export const leadFormSchema = z.discriminatedUnion("kind", [
  emergencySchema,
  estimateSchema,
  visitKind("repair", "tune_up", "membership_enquiry"),
]);

export type LeadFormInput = z.infer<typeof leadFormSchema>;

export function parseLeadForm(formData: FormData): unknown {
  const get = (key: string) => {
    const value = formData.get(key);
    return value === null ? "" : value;
  };

  return {
    kind: get("kind"),
    name: get("name"),
    phone: get("phone"),
    zip: get("zip"),
    email: get("email"),
    issue: get("issue"),
    address: get("address"),
    preferred_day: get("preferred_day"),
    preferred_window: get("preferred_window"),
    company: formData.get("company") ?? "",
    consent_email: formData.get("consent_email") !== null,
    consent_sms: formData.get("consent_sms") !== null,
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
  };
}

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
