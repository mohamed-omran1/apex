import type { ContentPageData } from "@/components/site/content-page";

export type TrustSlug =
  | "about"
  | "guarantee"
  | "reviews"
  | "financing"
  | "membership";

export type TrustPage = ContentPageData & {
  slug: TrustSlug;
  path: string;
  title: string;
  description: string;
};

const demoNote =
  "Sample page. Apex is a fictional Dallas company built to show what a working contractor site looks like. Nothing on this page is a real offer.";

const demoReviewsNote =
  "Sample reviews, clearly labeled. These rows are seeded demo data, not live Google reviews, and not a claim about a real shop.";

export const trustPages: Record<TrustSlug, TrustPage> = {
  about: {
    slug: "about",
    path: "/about",
    title: "About",
    description:
      "How the Apex shop runs: one Dallas office, one crew, a written price before any work, and the five promises the page stands behind.",
    crumb: "ABOUT",
    h1: "One crew. One office. One inbox.",
    lede: "Apex runs out of one office on Demo Street in Dallas. The person who books the job is the person who answers when you call back. The number you approve is the number you pay.",
    disclaimer: demoNote,
    sections: [
      {
        eyebrow: "HOW THE SHOP RUNS",
        heading: "Small on purpose.",
        paragraphs: [
          "One crew covers the six cities on this site. When you call, you get the owner or the dispatcher, not a national call center reselling your number to whoever bought the zip code.",
          "Every visit starts the same way: we diagnose, we write the price, you approve it, then the work starts. The $89 diagnostic is waived when you approve the repair, and a replacement estimate is free and given in the house.",
          "Emergency calls are answered around the clock. The booking form lands in the same inbox as the phone, so nothing falls between the two.",
        ],
      },
      {
        eyebrow: "WHAT WE PROMISE",
        heading: "The boring stuff that matters.",
        bullets: [
          "A written price before any work begins.",
          "No commission driven upsells. The tech does not get a cut of your replacement.",
          "No equipment leases hidden in the fine print.",
          "Background checked, insured techs in an Apex truck.",
          "If we miss your window without a call, the diagnostic is free.",
        ],
      },
      {
        eyebrow: "WHERE WE WORK",
        heading: "One Dallas office. Six cities served.",
        paragraphs: [
          "We serve Dallas, Plano, Irving, Garland, Richardson and Frisco from the office on Demo Street. We say serving, never office in. Texas rules do not let a non-office location be used to sell the work, and we would rather write that down than hide it.",
          "Not sure your address is in range? The booking form checks your ZIP against the active service areas before the request goes through.",
        ],
      },
    ],
    cta: {
      title: "Talk to the person who books the job.",
      sub: "Call if you want a person now. Or book, and the owner gets an email within seconds.",
    },
  },

  guarantee: {
    slug: "guarantee",
    path: "/guarantee",
    title: "Guarantee",
    description:
      "The Apex guarantee: written price first, on time or the diagnostic is free, a 90 day repair warranty, and no lease games.",
    crumb: "GUARANTEE",
    h1: "The price you approved is the price you pay.",
    lede: "Four promises, written the way the shop actually runs. If one of them gets broken, say so and we will make it right.",
    disclaimer: demoNote,
    sections: [
      {
        heading: "Price first. Then the work.",
        paragraphs: [
          "The tech diagnoses, writes the number, and waits for your yes. No price, no work. The $89 diagnostic is waived when you approve the repair, and a replacement estimate is free, in the house, in writing.",
          "The number on the invoice is the number you approved. If the job uncovers something new, we stop and quote it before touching it.",
        ],
      },
      {
        heading: "On time, or the diagnostic is free.",
        paragraphs: [
          "You pick a window: ASAP, morning, afternoon, or evening. We call when we are on the way. If we miss that window without a heads up, the diagnostic is on us. That promise is printed on the home page, so it is easy to hold us to it.",
        ],
      },
      {
        heading: "90 days on the repair.",
        paragraphs: [
          "If the same repair fails within 90 days of the invoice, we come back and fix it at no charge. Manufacturer parts and labor warranties are honored as written, and the paperwork is stapled to your invoice so nobody has to remember a verbal promise.",
        ],
      },
      {
        heading: "No lease games, no pressure.",
        paragraphs: [
          "We do not rent you your own equipment and nothing on this site signs you up for anything. If a system still has life in it, we say repair it and show you the math. If your ZIP is outside the area, we say that too.",
        ],
      },
    ],
    cta: {
      title: "Get the number before the work.",
      sub: "Call for the fastest answer, or book a window and get a written price at the visit.",
    },
  },

  reviews: {
    slug: "reviews",
    path: "/reviews",
    title: "Reviews",
    description:
      "Published Apex reviews with a visible SAMPLE tag: seeded demo data, clearly labeled, with an honest empty state when nothing is published.",
    crumb: "REVIEWS",
    h1: "What the demo inbox sounds like.",
    lede: "Sample reviews, clearly labeled. On a client deployment these become verified customers, and the SAMPLE tag goes away when the review is real.",
    disclaimer: demoReviewsNote,
    sections: [
      {
        heading: "How reviews work here.",
        paragraphs: [
          "Every review below is read from the published rows in the demo database. The owner publishes or unpublishes a review from the admin desk, and the SAMPLE tag follows the data, not the design.",
          "A review with the SAMPLE tag is seeded content for this fictional company. It is never a quote from a real customer, and it is never a claim about a real contractor.",
        ],
      },
    ],
    cta: {
      title: "Judge us on the visit, not the quotes.",
      sub: "Call if you want a person now. Or book, and the owner gets an email within seconds.",
    },
  },

  financing: {
    slug: "financing",
    path: "/financing",
    title: "Financing",
    description:
      "Financing a replacement through Apex: third party lender on approved credit, terms explained before the application, nothing charged on this site.",
    crumb: "FINANCING",
    h1: "The big swap, explained in plain numbers.",
    lede: "A replacement is the one purchase worth financing. We explain the terms before you apply, the lender runs the application, and this website never touches your card.",
    disclaimer: demoNote,
    sections: [
      {
        heading: "How it works.",
        paragraphs: [
          "It starts with the free estimate in the house. You get the equipment options and the full price in writing. If you want to finance it, we introduce you to the lender and the application happens there, after you have seen the number.",
          "Approval, term length and rate come from the lender, not from us. We do not see your credit report, we do not mark up the price for paying monthly, and cash buyers get the same quote.",
        ],
      },
      {
        heading: "What we would publish for a real client.",
        bullets: [
          "The lender's name and how the application is sent.",
          "The term options, with an example payment and an example APR disclosure.",
          "Whether the check is soft or hard, and at which step.",
          "Any promo term, like same as cash, with the date it expires.",
        ],
      },
      {
        heading: "What this demo does not do.",
        paragraphs: [
          "There is no lender application on this site and no card field anywhere in the booking flow. This is a fictional company showing page structure: a real deployment replaces this section with the lender's own disclosures, reviewed before launch.",
        ],
      },
    ],
    cta: {
      title: "Price the replacement first.",
      sub: "The estimate is free and in writing. Financing is a conversation after the number, not before it.",
    },
  },

  membership: {
    slug: "membership",
    path: "/membership",
    title: "Membership",
    description:
      "The Apex seasonal club: two tune-ups a year, priority windows when it is 104, no card charged on the site, ask through the booking form.",
    crumb: "MEMBERSHIP",
    h1: "Two tune-ups a year. Priority when it is 104.",
    lede: "The seasonal club is a maintenance plan, not a warehouse membership. Two visits, a priority window when everything else is booked, and a price that does not move during the term.",
    heroPrimary: {
      label: "Ask about the club",
      href: "/book?kind=membership_enquiry",
    },
    disclaimer: demoNote,
    sections: [
      {
        heading: "What is in it.",
        bullets: [
          "A spring AC tune-up and a fall furnace check, every year.",
          "Priority scheduling when the heat index is brutal and the phones are full.",
          "No overtime fee when a club visit has to happen after hours.",
          "A price that is locked for the term of the plan. No surprise increase at renewal.",
        ],
      },
      {
        heading: "No card is charged on this site.",
        paragraphs: [
          "There is no billing here, because this demo has no payments anywhere. You tap the button, the booking form opens with Seasonal Club already selected, and we call to walk through the plan. Nothing is charged until you say yes, and nothing is charged on this website at all.",
        ],
      },
      {
        heading: "Why the club exists.",
        paragraphs: [
          "A tune-up catches the capacitor in April instead of the first 100 degree week in July. It also keeps the filter, coil and refrigerant charge where the manufacturer wants them, which is how a system lasts fifteen years instead of nine.",
          "If a visit ever finds nothing to do, we tell you that too. The plan pays for itself in the two visits; the priority window is the part you actually feel in August.",
        ],
      },
    ],
    cta: {
      title: "Ask about the club in twenty seconds.",
      sub: "Pick Seasonal Club in the booking form and leave a number. There is no card, no signup fee, and no auto renewal.",
    },
  },
};

export const trustSlugs: TrustSlug[] = [
  "about",
  "guarantee",
  "reviews",
  "financing",
  "membership",
];

export function getTrustPage(slug: string): TrustPage | null {
  return trustPages[slug as TrustSlug] ?? null;
}
