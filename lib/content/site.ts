import { areaCities, areaSlugs } from "@/lib/content/areas";

export const site = {
  name: "Apex Climate Solutions",
  wordmark: "Apex",
  phoneDisplay: "(214) 555-0148",
  phoneHref: "tel:+12145550148",
  license: "TACLB000000C",
  address: "1200 Demo Street, Dallas, TX 75201",
  demoNoticeDesktop:
    "Sample site  ·  Apex is a fictional Dallas company. Reviews and the license number are placeholders.",
  noticeMobile: "Fictional demo company",
  offer: {
    desktop: "Fall furnace checkup  —  $89, with a written price before any work.",
    ends: "Ends October 31",
    mobile: "Furnace checkup $89  ·  Ends Oct 31",
  },
  nav: [
    { label: "Services", href: "/services" },
    { label: "Areas", href: "/service-areas" },
    { label: "Tips", href: "/tips" },
    { label: "Membership", href: "/#membership" },
    { label: "Reviews", href: "/#reviews" },
  ],
  footer: {
    blurb:
      "Fictional demo company. Not a licensed contractor. Sample reviews. Placeholder license.",
    services: [
      "Emergency",
      "AC repair",
      "Replacement",
      "Heating",
      "Tune-ups",
      "Indoor air",
    ],
    areas: areaSlugs.map((slug) => ({
      label: areaCities[slug],
      href: `/service-areas/${slug}`,
    })),
    hours: ["Mon–Sat 7a–7p", "Emergency line 24/7", "Book online anytime"],
    legal:
      "TDLR TACLB000000C — placeholder, not a real license. Regulated by the Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202.",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "SMS and email consent", href: "/consent" },
      { label: "Tips", href: "/tips" },
    ],
  },
} as const;
