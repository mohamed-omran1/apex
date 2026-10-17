export const home = {
  hero: {
    status: "Emergency line open",
    statusMeta: "Dallas–Fort Worth",
    h1: "When the AC quits, we pick up.",
    lede: "A one-crew shop for emergency repair, replacement, and seasonal tune-ups. Book in under a minute. The request lands with the owner, not a voicemail.",
    ledeMobile: "Book in under a minute. The owner sees it immediately.",
    rating: "4.9",
    ratingNote: "Sample reviews, clearly labeled",
    ratingNoteMobile: "sample reviews",
    image: "/images/hero-home.png",
    imageAlt:
      "A Dallas brick house at golden hour with a hedge and an outdoor AC condenser",
    caption: {
      eyebrow: "Most repair windows",
      title: "Same day, or the next morning.",
      body: "You pick ASAP, morning, afternoon, or evening. We confirm by phone — no live calendar.",
    },
  },
  trust: [
    {
      title: "Upfront price",
      body: "You see the number before any work starts.",
    },
    {
      title: "On time",
      body: "Late to the window, and the diagnostic is free.",
    },
    {
      title: "Checked techs",
      body: "Background-checked. Insured. One Dallas office.",
    },
    {
      title: "One inbox",
      body: "The form, the call, and the after-hours note land together.",
    },
  ],
  servicesHead: {
    eyebrow: "WHAT WE DO",
    heading: "Repair, replace, or just keep it running.",
    note: "Emergency is a short form and a phone number. A replacement is an estimate. A tune-up is a date on the calendar. Nothing else is hiding in a menu.",
  },
  priceBand: [
    {
      value: "$89",
      label: "Diagnostic",
      note: "Waived when you approve the repair.",
    },
    {
      value: "$180–$650",
      label: "Typical repair",
      note: "The range we actually see on a service call.",
    },
    {
      value: "Free",
      label: "Replacement estimate",
      note: "In the home. A written number, not a teaser.",
    },
  ],
  stepsHead: {
    eyebrow: "HOW A JOB STARTS",
    heading: "Three steps. Then a person calls you.",
  },
  steps: [
    {
      n: "01",
      title: "Tell us what's wrong",
      body: "Call, or use the form. An emergency only asks for your name, phone, zip, and the problem — so we still have a number if you hang up.",
    },
    {
      n: "02",
      title: "We call you back",
      body: "During the day, usually within minutes. After hours, the emergency line stays open. You are not waiting on a contact-form black hole.",
    },
    {
      n: "03",
      title: "A price, then the work",
      body: "The tech quotes before starting. You asked for a window — ASAP, morning, afternoon, or evening — not a live calendar.",
    },
  ],
  reviewsHead: {
    eyebrow: "SAMPLE REVIEWS",
    heading: "What the demo inbox sounds like.",
    note: "Labeled samples. Not live Google reviews, and not a claim about a real shop.",
  },
  reviews: [
    {
      quote:
        "The tech named the part before he opened the van. The bill matched the number from the phone call.",
      name: "Maria G.",
      meta: "Plano · Sep 12",
    },
    {
      quote:
        "Furnace checkup took an hour. He showed me the filter and did not try to sell a system I do not need yet.",
      name: "James Okonkwo",
      meta: "Richardson · Oct 2",
    },
    {
      quote:
        "Called at 9 at night. Somebody picked up, and a truck was in the driveway before breakfast.",
      name: "Priya S.",
      meta: "East Dallas · Aug 28",
    },
  ],
  areasHead: {
    eyebrow: "WHERE WE DRIVE",
    heading: "One Dallas office. Six cities served from it.",
    lede: "We say serving, not office in. A second address is not a place we sell work from.",
  },
  areas: [
    {
      slug: "dallas",
      name: "Dallas",
      body: "The office. Lakewood, Oak Cliff, Preston Hollow, East Dallas.",
    },
    {
      slug: "plano",
      name: "Plano",
      body: "West Plano and Legacy. Spring tune-ups book out early.",
    },
    {
      slug: "irving",
      name: "Irving",
      body: "Las Colinas and Valley Ranch, mostly 90s systems.",
    },
    {
      slug: "garland",
      name: "Garland",
      body: "Firewheel and central houses with original furnaces.",
    },
    {
      slug: "richardson",
      name: "Richardson",
      body: "Canyon Creek and the neighborhoods off 75.",
    },
    {
      slug: "frisco",
      name: "Frisco",
      body: "Newer builds that still need a fall furnace check.",
    },
  ],
  membership: {
    eyebrow: "SEASONAL CLUB",
    heading: "Two tune-ups a year. Priority when it is 104.",
    body: "No card is charged on this site. Leave a number and we will explain the plan on the phone.",
    cta: "Ask about the club",
  },
  faq: {
    heading: "Before you call.",
    items: [
      {
        q: "How fast can someone get here?",
        a: "Same-day windows on most days. Emergencies jump the list. After hours, the phone is still answered.",
      },
      {
        q: "What does a visit cost?",
        a: "The diagnostic is $89, and it is waived if you approve the repair. Most repairs land between $180 and $650. A replacement estimate is free.",
      },
      {
        q: "Do you have an office in Plano?",
        a: "No. One office, in Dallas. We serve Plano, Irving, Garland, Richardson, and Frisco from it.",
      },
      {
        q: "Can I join the maintenance plan online?",
        a: "You can ask. There is no billing here. We will walk through the two tune-ups, and you decide.",
      },
    ],
  },
  cta: {
    title: "The house is hot. Leave a number.",
    sub: "Call if you want a person now. Or book, and the owner gets an email within seconds.",
  },
} as const;
