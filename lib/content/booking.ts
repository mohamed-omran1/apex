import type { LeadKind } from "@/lib/validation/lead";

export interface BookKindCopy {
  chipLabel: string;
  eyebrow: string;
  title: string;
  stepLabel: string;
  stepSub: string;
  submitLabel: string;
}

export const bookKinds: Record<LeadKind, BookKindCopy> = {
  emergency: {
    chipLabel: "Emergency",
    eyebrow: "EMERGENCY",
    title: "Four fields. The owner calls you back.",
    stepLabel: "Emergency",
    stepSub: "The short form, four fields",
    submitLabel: "Send the short form",
  },
  repair: {
    chipLabel: "Repair",
    eyebrow: "REPAIR",
    title: "Tell us what the system is doing.",
    stepLabel: "Repair visit",
    stepSub: "A tech to look at it",
    submitLabel: "Request the repair",
  },
  estimate: {
    chipLabel: "Free estimate",
    eyebrow: "FREE ESTIMATE",
    title: "A visit to price the new system.",
    stepLabel: "Free estimate",
    stepSub: "Replacement, not a repair",
    submitLabel: "Request the estimate",
  },
  tune_up: {
    chipLabel: "Tune-up",
    eyebrow: "TUNE-UP",
    title: "Put the seasonal checkup on the books.",
    stepLabel: "Tune-up",
    stepSub: "The seasonal checkup",
    submitLabel: "Book the tune-up",
  },
  membership_enquiry: {
    chipLabel: "Club question",
    eyebrow: "SEASONAL CLUB",
    title: "Ask about the Seasonal Club.",
    stepLabel: "Seasonal Club",
    stepSub: "We call. No billing here",
    submitLabel: "Ask about the club",
  },
};

export const booking = {
  heading: "Under a minute, on a desk too.",
  headingFix: (count: number) =>
    `Fix ${count} field${count === 1 ? "" : "s"}, then send.`,
  stepZipLabel: "ZIP",
  stepZipIdle: "Your ZIP",
  stepZipServed: (zip: string, city: string) => `${zip} · ${city} · we serve this`,
  stepZipOutside: (zip: string) => `${zip} is outside the drive`,
  stepDetailsLabel: "Details",
  stepDetailsIdle: "Name, phone, and what you need",
  stepDetailsEmergency: "Name, phone, ZIP",
  stepDetailsVisit: "Address and a window",
  zipWarning: (zip: string) =>
    `${zip} is outside Dallas–Fort Worth. Leave the number anyway, or try another ZIP.`,
  labels: {
    kind: "What do you need?",
    name: "Name",
    phone: "Phone",
    zip: "ZIP",
    email: "Email",
    address: "Address",
    preferredDay: "Preferred day",
    preferredWindow: "Window",
    issue: {
      emergency: "What is going on?",
      other: "Anything we should know?",
    },
    consentEmail: "Email me a written copy of this request.",
    consentSms: "Text me about maintenance (coming later in this demo).",
    optional: "optional",
  },
  placeholders: {
    name: "James Okonkwo",
    phone: "(469) 555-0172",
    zip: "75204",
    email: "you@example.com",
    address: "4180 West Spring Creek, Plano",
    issue: "No cool air upstairs since this morning",
  },
  windows: [
    { value: "asap", label: "ASAP" },
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" },
  ] as const,
  success: {
    eyebrow: "REQUEST IN",
    duplicateEyebrow: "ALREADY IN",
    title: "Got it.",
    duplicateTitle: "We have it.",
    again: "Send another request",
  },
} as const;
