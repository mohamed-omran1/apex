import type { ContentPageData } from "@/components/site/content-page";

export type LegalSlug = "privacy" | "terms" | "consent";

export type LegalPage = ContentPageData & {
  slug: LegalSlug;
  path: string;
  title: string;
  description: string;
};

const sampleDisclaimer =
  "Sample text, not legal advice. Apex is a fictional company and these pages show the structure a real contractor would publish. A live deployment must replace them with counsel reviewed text.";

export const legalPages: Record<LegalSlug, LegalPage> = {
  privacy: {
    slug: "privacy",
    path: "/privacy",
    title: "Privacy",
    description:
      "What the Apex booking form collects (name, phone, ZIP, address for a booked visit), that SMS is off in the demo, and how long leads are kept.",
    crumb: "PRIVACY",
    h1: "What the form collects, in plain language.",
    lede: "One form, one write path, no trackers. This page lists exactly what lands in the inbox when you send a request.",
    disclaimer: sampleDisclaimer,
    sections: [
      {
        heading: "What the booking form collects.",
        bullets: [
          "Name and phone, on every request. We need the phone to call you back.",
          "ZIP, on every request, so the address can be checked against the active service areas.",
          "A short description of the problem, in your words.",
          "Email, only if you choose to add it. The form works without one.",
          "Street address, only for requests that need a visit: estimates and booked appointments. The emergency form never asks for it.",
          "Preferred day and window, when you pick one.",
        ],
      },
      {
        heading: "SMS is off in this demo.",
        paragraphs: [
          "The SMS consent checkbox exists so the wording and the timestamp are stored from day one, but nothing is texted from this site. The MVP sends email only: a confirmation to you and an alert to the owner.",
          "When a real deployment turns SMS on, the checkbox already collects consent with a timestamp and the wording version that was shown to the visitor.",
        ],
      },
      {
        heading: "How long it is kept.",
        paragraphs: [
          "A lead stays in the admin inbox so the owner can follow up and so a reference code can be checked later. This demo holds seeded and submitted rows until someone deletes them; there is no analytics warehouse behind the form.",
          "No cookies are used for tracking, there is no chat widget, no tag manager, and no third party advertising pixel on this site.",
        ],
        links: [
          { label: "Read the terms", href: "/terms" },
          { label: "Consent explained", href: "/consent" },
        ],
      },
    ],
    cta: {
      title: "Send the minimum, get a call back.",
      sub: "Four fields for an emergency. The request lands in one inbox, and nobody sells your number.",
    },
  },

  terms: {
    slug: "terms",
    path: "/terms",
    title: "Terms",
    description:
      "Short plain terms for the Apex demo site: fictional company, sample content, no contracts formed through this website.",
    crumb: "TERMS",
    h1: "Terms, short and plain.",
    lede: "This site is a demo for a fictional Dallas HVAC company. The terms are kept short on purpose.",
    disclaimer: sampleDisclaimer,
    sections: [
      {
        heading: "What this site is.",
        paragraphs: [
          "Apex Climate Solutions is a fictional company. The phone number is a placeholder, the license number TACLB000000C is a placeholder, the reviews are labeled samples, and the addresses used in examples are demo data.",
          "Using this site does not form a contract with any contractor. A real job starts when a real company gives you a written price and you approve it.",
        ],
      },
      {
        heading: "What you can expect from the site.",
        bullets: [
          "The booking form is the only way this site sends information anywhere, and it goes to one inbox.",
          "Prices and promises shown here are example copy for the demo, not offers.",
          "You may not misuse the site: no scraping, no automated submissions, no attempts to reach the admin desk without signing in.",
        ],
      },
      {
        heading: "Content and links.",
        paragraphs: [
          "Page copy, images and structured data belong to this demo. External links, when present, are there for reference; this site does not run ads or affiliate tracking.",
        ],
        links: [
          { label: "Privacy", href: "/privacy" },
          { label: "Consent", href: "/consent" },
        ],
      },
    ],
    cta: {
      title: "Questions before you book?",
      sub: "Call if you want a person now. Or book, and the owner gets an email within seconds.",
    },
  },

  consent: {
    slug: "consent",
    path: "/consent",
    title: "SMS and email consent",
    description:
      "How the Apex consent checkbox works: what it says, that consent is stored with a timestamp and wording version, and that SMS stays off in the MVP.",
    crumb: "CONSENT",
    h1: "Email and SMS consent, explained.",
    lede: "The booking form has a consent checkbox. This page is what that checkbox means, what gets stored, and how to undo it.",
    disclaimer: sampleDisclaimer,
    sections: [
      {
        heading: "What the checkbox says.",
        paragraphs: [
          "Email consent asks us to email you about your request and follow ups. SMS consent asks us to text you about the same, and only if texting is turned on for the site. In this MVP, texting is off: the box can be checked, nothing is sent.",
          "Consent is not a condition of booking. You can submit the form without either box and we will still call you back on the number you gave us.",
        ],
      },
      {
        heading: "What gets stored.",
        paragraphs: [
          "When you consent, the lead record stores three things: the consent flag itself, the timestamp of when you checked it, and the wording version that was on screen, for example v1. If the wording ever changes, new submissions store the new version and older records keep the one you actually saw.",
          "Consent is never set on your behalf, and it is never carried over from another site.",
        ],
      },
      {
        heading: "Changing your mind.",
        paragraphs: [
          "Call the number in the footer or reply to any email and we will turn off email follow ups. In this demo you can also edit or delete the lead from the admin desk.",
        ],
        links: [
          { label: "Privacy page", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
    ],
    cta: {
      title: "One checkbox, no fine print games.",
      sub: "Call if you want a person now. Or book, and the owner gets an email within seconds.",
    },
  },
};

export const legalSlugs: LegalSlug[] = ["privacy", "terms", "consent"];

export function getLegalPage(slug: string): LegalPage | null {
  return legalPages[slug as LegalSlug] ?? null;
}
