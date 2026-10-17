import type { ContentPageData } from "@/components/site/content-page";

export type ArticleSlug =
  | "spring-ac-tune-up-checklist"
  | "ac-not-cooling-five-checks"
  | "fall-furnace-check";

export type Article = ContentPageData & {
  slug: string;
  title: string;
  description: string;
  season: "Spring" | "Summer" | "Fall";
  published_on: string;
};

const demoNote =
  "Sample article for this fictional demo site. The checks below are the real sequence a technician runs; a live deployment would date and review every post.";

export const articles: Article[] = [
  {
    slug: "spring-ac-tune-up-checklist",
    title: "Spring AC tune-up checklist",
    description:
      "The nine point spring AC tune-up: what a homeowner can clear before we arrive, what the technician measures, and what you get in writing after.",
    season: "Spring",
    published_on: "2026-03-02",
    crumb: "TIPS  /  SPRING AC TUNE-UP CHECKLIST",
    h1: "Spring AC tune-up checklist.",
    lede: "The first 90 degree day is the worst day to find a weak capacitor. This is the nine point check we run in spring, in order, plus the two minutes of prep that make the visit faster.",
    heroPrimary: { label: "Book a tune-up", href: "/book?type=tune_up" },
    disclaimer: demoNote,
    sections: [
      {
        eyebrow: "BEFORE WE ARRIVE",
        heading: "Two minutes of yard work.",
        bullets: [
          "Change the filter if it has been more than 90 days. A clogged filter hides the real problem behind a fake one.",
          "Clear two feet of space around the outdoor unit. Move the bikes, the firewood, and the hedge trimmings.",
          "Run the system for ten minutes before the visit so the technician measures it under load, not after it has been off all morning.",
          "Find the model and serial numbers on the indoor unit. They are on the sticker, usually on the air handler or furnace door.",
        ],
      },
      {
        eyebrow: "ON THE VISIT",
        heading: "The nine points, in order.",
        bullets: [
          "Capacitor tested in microfarads against its rating, not just looked at.",
          "Contactor pitted or welded, and the coil around it.",
          "Refrigerant charge measured against superheat and subcool, never guessed by feel.",
          "Indoor and outdoor coils inspected for the spring pollen blanket.",
          "Condensate drain flushed, since algae starts in the warm months.",
          "Electrical connections torqued and inspected for heat marks.",
          "Thermostat calibrated against a known reference.",
          "Blower amp draw checked against the nameplate range.",
          "Filter size noted so the next change takes ten seconds, not twenty.",
        ],
      },
      {
        heading: "What you get in writing.",
        paragraphs: [
          "A condition note on every visit: what passed, what is wearing, and what it costs to fix it if anything does. Numbers first, work second, same as every other visit we run.",
          "If the system passes clean, we tell you that too. A tune-up is not a sales call with a clipboard.",
        ],
      },
    ],
    links: [
      { label: "Tune-ups service page", href: "/services/tune-ups" },
      { label: "Ask about the seasonal club", href: "/book?kind=membership_enquiry" },
    ],
    cta: {
      title: "Book the spring visit before the heat does.",
      sub: "Two tune ups a year is the club. One visit is a booking form and a date.",
    },
  },

  {
    slug: "ac-not-cooling-five-checks",
    title: "AC not cooling? Five checks before you call",
    description:
      "Five homeowner checks before calling for AC repair: filter, thermostat, breaker, closed vents, and the outdoor unit, plus when to stop and call.",
    season: "Summer",
    published_on: "2026-06-05",
    crumb: "TIPS  /  AC NOT COOLING",
    h1: "AC not cooling? Five checks first.",
    lede: "Half of the no cooling calls end with a filter, a thermostat, or a tripped breaker. Five checks take five minutes and might save you the visit fee. When to stop and call is at the bottom.",
    heroPrimary: { label: "Book a repair", href: "/book?type=repair" },
    disclaimer: demoNote,
    sections: [
      {
        eyebrow: "FIVE CHECKS",
        heading: "In this order.",
        bullets: [
          "Filter. Pull it out. If light does not pass through, that alone can stop the cooling. Replace it and run the system twenty minutes.",
          "Thermostat. Set it to COOL, two degrees below the room temperature, and make sure the fan says AUTO. Dead batteries behave like a broken thermostat.",
          "Breaker. Check both the indoor panel and the outdoor disconnect by the unit. A breaker that trips again after reset means stop and call.",
          "Vents. Walk the house. Supply vents open, return vents unblocked by furniture or curtains. Half the house starves when one return is covered.",
          "Outdoor unit. If the fan is not spinning while the system is running, kill the power at the disconnect and call. Do not spin it by hand.",
        ],
      },
      {
        heading: "When to stop checking and call.",
        paragraphs: [
          "Call right away if the house is climbing past the high 70s, if the breaker trips a second time, if you smell something burning at the unit, or if water is pouring from the air handler.",
          "Those are the emergency conditions. The form is four fields: name, phone, ZIP, and what is wrong, so we still have a number if you stop halfway.",
          "If it still cools, just not well, or one room runs warm in the afternoon, that is a normal repair window: pick ASAP, morning, afternoon, or evening.",
        ],
      },
      {
        heading: "What the repair visit costs.",
        paragraphs: [
          "The diagnostic is $89 and it is waived when you approve the repair. Most repairs land between $180 and $650. The price is written before any work starts, every time.",
        ],
      },
    ],
    links: [
      { label: "AC repair page", href: "/services/ac-repair" },
      { label: "Send the emergency form", href: "/book?type=emergency" },
    ],
    cta: {
      title: "Filters checked and it still is not cooling?",
      sub: "Book a repair window, or call if the house is already climbing.",
    },
  },

  {
    slug: "fall-furnace-check",
    title: "The fall furnace check",
    description:
      "What the $89 fall furnace check covers: heat exchanger inspection, safety controls, combustion check, and why October is the month to book it.",
    season: "Fall",
    published_on: "2026-09-20",
    crumb: "TIPS  /  FALL FURNACE CHECK",
    h1: "The fall furnace check.",
    lede: "October is the cheap month. The fall furnace check is $89 through Halloween, and it is the visit that finds a cracked heat exchanger before the first cold night, not during it.",
    heroPrimary: { label: "Book the fall check", href: "/book?type=tune_up" },
    disclaimer: demoNote,
    sections: [
      {
        eyebrow: "WHY FALL",
        heading: "Book it while the trucks are free.",
        paragraphs: [
          "Furnaces fail on the first cold snap, which is the same night everyone else calls. A check in October happens in a normal week, with the parts in the truck and no emergency queue.",
          "The offer on this site ends October 31: the fall checkup is $89 with a written price before any work, same as every other visit.",
        ],
      },
      {
        eyebrow: "WHAT WE CHECK",
        heading: "The list that matters.",
        bullets: [
          "Heat exchanger inspected for cracks and rust, with a mirror and a burn test.",
          "Safety controls proven: limit switch, flame sensor, pressure switches.",
          "Combustion checked for clean burn and proper venting, since a lazy flame is how carbon monoxide gets lazy too.",
          "Gas pressure and temperature rise measured against the nameplate.",
          "Blower motor amps and capacitor checked before the season loads them.",
          "Filter, drain, and thermostat verified the same way spring does it.",
        ],
      },
      {
        heading: "Old furnace, new furnace, same check.",
        paragraphs: [
          "A furnace from the 70s can pass the check and keep running another season. It can also fail it and get a written quote the same day, with the repair number against the remaining life in plain numbers.",
          "That conversation is the whole point: you decide with the price in hand, not with the house at 55 degrees.",
        ],
      },
    ],
    links: [
      { label: "Heating repair page", href: "/services/heating-repair" },
      { label: "Book any visit", href: "/book" },
    ],
    cta: {
      title: "The cold snap is coming. Book the check now.",
      sub: "Eighty nine dollars through October 31, and a written price if anything needs doing.",
    },
  },
];

export function getArticle(slug: string): Article | null {
  return articles.find((article) => article.slug === slug) ?? null;
}

export const articleSlugs: string[] = articles.map((article) => article.slug);

/** "2026-03-02" to "March 2, 2026" without timezone drift. */
export function formatArticleDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
