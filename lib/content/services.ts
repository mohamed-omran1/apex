import { site } from "@/lib/content/site";

export type ServiceCard = {
  title: string;
  body: string;
  tone: "paper" | "sage";
};

export type ServiceAction = {
  label: string;
  href: string;
};

export type Service = {
  slug: string;
  crumb: string;
  card: {
    eyebrow: string;
    title: string;
    homeBlurb: string;
    indexBlurb: string;
  };
  h1: string;
  lede: string;
  primary: ServiceAction;
  secondary: ServiceAction;
  heroImage?: { src: string; alt: string };
  cards: ServiceCard[];
  chips?: string[];
  included?: { eyebrow: string; heading: string; chips: string[] };
  faqs: { q: string; a: string }[];
  cta: { title: string; sub: string };
};

const call: ServiceAction = {
  label: `Call ${site.phoneDisplay}`,
  href: site.phoneHref,
};
const book: ServiceAction = { label: "Book a visit", href: "/book" };

export const services: Service[] = [
  {
    slug: "emergency",
    crumb: "SERVICES  /  EMERGENCY",
    card: {
      eyebrow: "EMERGENCY",
      title: "24/7 emergency",
      homeBlurb:
        "System down, house heating up. Four fields: name, phone, zip, and what is wrong.",
      indexBlurb:
        "System down, house heating up. Name, phone, ZIP, what is wrong.",
    },
    h1: "The line is open. The form is four fields.",
    lede: "If the house is climbing and the system is dead, call (214) 555-0148. If you would rather not talk yet, the emergency form asks for your name, phone, ZIP, and what is wrong — so we still have a number if you stop halfway.",
    primary: call,
    secondary: { label: "Send the short form", href: "/book" },
    cards: [
      {
        title: "Call us now",
        body: "No cooling and the house is already hot. A burning smell at the unit. A carbon-monoxide alarm. Water pouring from the air handler. Gas smell: leave, then call the gas company and us.",
        tone: "paper",
      },
      {
        title: "Book a window instead",
        body: "It still runs, a room is warm, or you want the fall checkup. Those are repair and tune-up requests. They are not pinned to the top of the inbox.",
        tone: "sage",
      },
    ],
    chips: [
      "Answered 24/7, including the form.",
      "Urgent emails start with URGENT.",
      "The lead is pinned in the inbox.",
      "A second call within 10 minutes updates the same lead.",
    ],
    faqs: [
      {
        q: "How fast can you get here?",
        a: "Emergencies jump the list. We give you a window when we call back, not a fake countdown on the website.",
      },
      {
        q: "What if my ZIP is outside the area?",
        a: "We say so. You can still leave a number, and we will tell you we do not drive there.",
      },
    ],
    cta: {
      title: "House hot? Call. Or leave the number.",
      sub: "Either one reaches the owner. The email shows up in seconds.",
    },
  },
  {
    slug: "ac-repair",
    crumb: "SERVICES  /  AC REPAIR",
    card: {
      eyebrow: "REPAIR",
      title: "AC repair",
      homeBlurb:
        "Not cooling, short cycling, warm air. Most repair visits land between $180 and $650.",
      indexBlurb: "Not cooling, short cycling, warm air. Most visits $180–$650.",
    },
    h1: "AC repair, with the number before the work.",
    lede: "Not cooling, short cycling, or warm air from the vents. Most repair visits in Dallas–Fort Worth land between $180 and $650. The $89 diagnostic is waived if you approve the repair.",
    primary: call,
    secondary: { label: "Book a repair", href: "/book" },
    heroImage: {
      src: "/images/hero-ac-repair.png",
      alt: "Outdoor AC condenser with refrigerant lines against a brick wall",
    },
    cards: [
      {
        title: "Call now if",
        body: "The house is climbing past the high 70s, the breaker keeps tripping, or you smell something burning at the unit. Use the emergency form: name, phone, zip, what is wrong.",
        tone: "paper",
      },
      {
        title: "It can wait until morning if",
        body: "It still cools, just not well, or a room runs warm in the afternoon. Book a repair window: ASAP, morning, afternoon, or evening. We confirm by phone.",
        tone: "sage",
      },
    ],
    included: {
      eyebrow: "WHAT THE $89 COVERS",
      heading: "Show up. Diagnose. Write the price. You decide.",
      chips: [
        "The visit and the diagnosis.",
        "A written price before any parts.",
        "Waived if you approve the repair.",
        "No lease, no shop, no twelve-menu site.",
      ],
    },
    faqs: [
      {
        q: "Is the $89 diagnostic really waived?",
        a: "It is waived when you approve the repair. If you decline the work, you owe the $89 diagnostic for the visit and we leave it there.",
      },
      {
        q: "How fast can you get here?",
        a: "Same-day windows on most days. Emergencies jump the list. We confirm the window by phone, not with a live calendar.",
      },
    ],
    cta: {
      title: "Still warm, and getting warmer?",
      sub: "Call now, or leave a number. Either one reaches the owner — the email shows up in seconds.",
    },
  },
  {
    slug: "ac-replacement",
    crumb: "SERVICES  /  REPLACEMENT",
    card: {
      eyebrow: "INSTALL",
      title: "AC replacement",
      homeBlurb:
        "A planned install. Free in-home estimate and financing in plain numbers. No lease program.",
      indexBlurb: "A free in-home estimate. A written range, not a lease.",
    },
    h1: "A new system, priced in the house.",
    lede: "Replacement is a planned job, not a midnight one. The estimate visit is free. Most full systems we write up in Dallas–Fort Worth land between $7,500 and $14,500 before any rebate. That is a range, not your quote.",
    primary: { label: "Book a free estimate", href: "/book" },
    secondary: call,
    cards: [
      {
        title: "What the visit includes",
        body: "We look at the equipment, the ducts, and the electrical. You get a written number before anyone orders a system. Financing is explained in dollars, not a teaser rate.",
        tone: "paper",
      },
      {
        title: "What we will not do",
        body: "No lease program, no online shop, and no twelve-item service menu. If repair is the smarter buy, we say so and price the repair instead.",
        tone: "sage",
      },
    ],
    chips: [
      "Written price before the order.",
      "Good, better, and best — three options, not thirty.",
      "Rebate paperwork explained, not promised.",
      "Old equipment hauled away.",
    ],
    faqs: [
      {
        q: "How long does a replacement take?",
        a: "Most changeouts are a full day. We confirm the day when the estimate is approved, not when the form is sent.",
      },
      {
        q: "Do you finance on this website?",
        a: "No. Nothing is charged here. If you want a monthly number, we walk through it at the kitchen table and you apply with the lender, not with us.",
      },
    ],
    cta: {
      title: "Want the estimate, not a sales script?",
      sub: "Leave a number. The owner sees it, then someone calls to set the visit.",
    },
  },
  {
    slug: "heating-repair",
    crumb: "SERVICES  /  HEATING",
    card: {
      eyebrow: "HEAT",
      title: "Heating repair",
      homeBlurb: "Furnaces and heat pumps, before the first cold night in Dallas.",
      indexBlurb: "Furnaces and heat pumps. $89 checkup through October 31.",
    },
    h1: "Heat, before the first cold night.",
    lede: "Furnaces and heat pumps. In Dallas the season turns fast, so the $89 furnace checkup runs through October 31. Repairs are quoted before the work. Most heating repairs we see land between $180 and $750.",
    primary: call,
    secondary: book,
    cards: [
      {
        title: "Call now if",
        body: "You smell gas, the furnace short-cycles and the house is cold, or a carbon-monoxide alarm is going off. Leave the house if the alarm is sounding, then call.",
        tone: "paper",
      },
      {
        title: "It can wait for a window if",
        body: "The heat works but runs constantly, a room stays cold, or you are due for the fall checkup and nothing is actually broken.",
        tone: "sage",
      },
    ],
    chips: [
      "$89 checkup through October 31.",
      "Heat exchanger inspected, not shrugged at.",
      "Filter shown to you, not just swapped.",
      "Quote before parts.",
    ],
    faqs: [
      {
        q: "Is a checkup the same as a repair?",
        a: "No. The checkup is the inspection and the cleaning. If we find a repair, you get a price and you decide. The $89 is waived when you approve that repair.",
      },
      {
        q: "Do you service heat pumps?",
        a: "Yes. A lot of newer Frisco and Plano houses have them, and they need the fall check the same as a gas furnace.",
      },
    ],
    cta: {
      title: "Book the furnace checkup.",
      sub: "Or call if the heat is already out. Emergency calls still use the short form.",
    },
  },
  {
    slug: "tune-ups",
    crumb: "SERVICES  /  TUNE-UPS",
    card: {
      eyebrow: "SEASON",
      title: "Tune-ups",
      homeBlurb: "Spring AC and fall furnace. The $89 furnace checkup runs through October 31.",
      indexBlurb: "Spring AC and fall furnace. Book before the season turns.",
    },
    h1: "Two seasons. One checkup each.",
    lede: "Spring is the AC. Fall is the furnace. Book the fall checkup before the first cold week, not during it. Through October 31 the furnace visit is $89, with a written price if we find something to fix.",
    primary: book,
    secondary: call,
    cards: [
      {
        title: "On the AC visit",
        body: "Filter, condensate drain, outdoor coil clearance, electrical draw, refrigerant temperatures, and a plain answer about whether the system is near the end.",
        tone: "paper",
      },
      {
        title: "On the furnace visit",
        body: "Filter, burners, flame sensor, limit switch, the heat exchanger, and the flue. If the exchanger is unsafe we shut it down and say so.",
        tone: "sage",
      },
    ],
    chips: [
      "You pick a morning, afternoon, or evening.",
      "Not a live calendar. We confirm by phone.",
      "Members get both visits and priority.",
      "No contract signed on this site.",
    ],
    faqs: [
      {
        q: "What if you find a repair?",
        a: "You get the number before we start. You can decline. The diagnostic fee is waived only when you approve the repair.",
      },
      {
        q: "Can I put both tune-ups on one membership?",
        a: "Yes. That is the Seasonal Club. Ask on the membership page. We call. We do not bill you here.",
      },
    ],
    cta: {
      title: "Put the fall checkup on the books.",
      sub: "The offer ends October 31. After that the visit is still available. The price changes.",
    },
  },
  {
    slug: "indoor-air",
    crumb: "SERVICES  /  INDOOR AIR",
    card: {
      eyebrow: "AIR",
      title: "Indoor air",
      homeBlurb: "Filters, ducts, and humidity. We say what is worth doing, and what can wait.",
      indexBlurb: "Filters, drains, ducts, humidity. No gadget wall.",
    },
    h1: "Filters, ducts, and humidity. No gadget wall.",
    lede: "Most houses need a filter on schedule and a drain that actually drains. Some need a duct repair or a dehumidifier. We say which is which. We do not lead with a catalog of air purifiers.",
    primary: book,
    secondary: call,
    cards: [
      {
        title: "Worth doing",
        body: "The right filter, changed on a schedule. A clogged condensate line. A return that was never cut large enough. A duct that has come apart in the attic.",
        tone: "paper",
      },
      {
        title: "Often a later conversation",
        body: "Whole-home UV, a media cabinet, and a purifier. Sometimes yes, after the basics. We will not sell them on the first visit to make the ticket bigger.",
        tone: "sage",
      },
    ],
    chips: [
      "Humidity is the Dallas problem in July.",
      "Leaks waste more money than a new filter brand.",
      "We show you the filter, not a brochure.",
      "Price before any add-on.",
    ],
    faqs: [
      {
        q: "Will a new filter fix a warm house?",
        a: "If the filter is packed solid, sometimes. If the system is tired or the ducts are open in the attic, no. We check the cheap cause first.",
      },
      {
        q: "Do you clean ducts?",
        a: "When they are actually dirty or disconnected. Not as a default add-on for every tune-up.",
      },
    ],
    cta: {
      title: "Tell us what the air feels like.",
      sub: "Hot, sticky, dusty, or just overdue. The form asks for that in one line.",
    },
  },
];

export const serviceSlugs = services.map((s) => s.slug);

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
