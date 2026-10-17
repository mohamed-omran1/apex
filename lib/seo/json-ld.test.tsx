import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { FaqSection } from "@/components/site/faq-section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  hvacBusinessJsonLd,
} from "@/lib/seo/json-ld";
import { getService } from "@/lib/content/services";
import { site } from "@/lib/content/site";

function parseRendered(data: object): Record<string, unknown> {
  const { container } = render(<JsonLd data={data} />);
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script!.innerHTML) as Record<string, unknown>;
}

describe("JSON-LD payloads", () => {
  it("all builders render a script that parses as valid JSON", () => {
    expect(parseRendered(hvacBusinessJsonLd())).toBeTruthy();
    expect(
      parseRendered(
        breadcrumbJsonLd([
          { name: "SERVICES", path: "/services" },
          { name: "EMERGENCY", path: "/services/emergency" },
        ]),
      ),
    ).toBeTruthy();
    expect(
      parseRendered(faqPageJsonLd([{ q: "Q?", a: "A." }])),
    ).toBeTruthy();
  });

  it("escapes angle brackets so markup can never break the script", () => {
    const { container } = render(
      <JsonLd data={{ "@type": "Test", text: "<script>alert(1)</script>" }} />,
    );
    const script = container.querySelector("script");
    expect(script!.innerHTML).not.toContain("<script>");
    const parsed = JSON.parse(script!.innerHTML) as { text: string };
    expect(parsed.text).toBe("<script>alert(1)</script>");
  });

  it("HVACBusiness carries the site constants from site.ts", () => {
    const payload = parseRendered(hvacBusinessJsonLd());
    expect(payload["@type"]).toBe("HVACBusiness");
    expect(payload.name).toBe(site.name);
    expect(payload.telephone).toBe("+12145550148");
    expect(payload.license).toBe("TACLB000000C");
    expect(payload.priceRange).toBe("$$");

    const address = payload.address as Record<string, string>;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.streetAddress).toBe("1200 Demo Street");
    expect(address.addressLocality).toBe("Dallas");
    expect(address.addressRegion).toBe("TX");
    expect(address.postalCode).toBe("75201");
    expect(address.addressCountry).toBe("US");

    const hours = payload.openingHoursSpecification as {
      opens: string;
      closes: string;
      dayOfWeek: string[];
    }[];
    expect(hours).toHaveLength(1);
    expect(hours[0].opens).toBe("07:00");
    expect(hours[0].closes).toBe("19:00");
    expect(hours[0].dayOfWeek).toContain("Saturday");
    expect(hours[0].dayOfWeek).not.toContain("Sunday");

    const served = payload.areaServed as { name: string }[];
    expect(served.map((city) => city.name)).toEqual([
      "Dallas",
      "Plano",
      "Irving",
      "Garland",
      "Richardson",
      "Frisco",
    ]);
  });

  it("BreadcrumbList items are positioned and absolute", () => {
    const payload = parseRendered(
      breadcrumbJsonLd([
        { name: "SERVICES", path: "/services" },
        { name: "EMERGENCY", path: "/services/emergency" },
      ]),
    );
    const items = payload.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[0].name).toBe("SERVICES");
    expect(String(items[0].item)).toMatch(/^https?:\/\//);
    expect(String(items[1].item)).toMatch(/\/services\/emergency$/);
  });

  it("FAQPage text matches the visible FAQ section exactly", () => {
    const service = getService("emergency");
    expect(service).not.toBeNull();
    const faqs = service!.faqs;

    const { container } = render(
      <>
        <FaqSection items={faqs} />
        <JsonLd data={faqPageJsonLd(faqs)} />
      </>,
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const payload = JSON.parse(script!.innerHTML) as {
      "@type": string;
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(payload["@type"]).toBe("FAQPage");

    const visible = container.querySelector("section")!;
    const questions = [...visible.querySelectorAll("h3")].map(
      (node) => node.textContent ?? "",
    );
    const answers = [...visible.querySelectorAll("p")]
      .map((node) => node.textContent ?? "")
      .filter((text) => text.length > 0 && text !== "QUESTIONS");

    expect(payload.mainEntity.map((item) => item.name)).toEqual(questions);
    expect(payload.mainEntity.map((item) => item.acceptedAnswer.text)).toEqual(
      answers,
    );
  });
});
