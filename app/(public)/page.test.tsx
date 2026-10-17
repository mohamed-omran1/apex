import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(public)/page";
import { home } from "@/lib/content/home";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    priority?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("home page", () => {
  it("renders the hero and services grid", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /when the ac quits/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /24\/7 emergency/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /before you call/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /demo inbox sounds like/i }),
    ).toBeInTheDocument();
  });

  it("ships FAQPage JSON-LD that matches the visible FAQ text", () => {
    const { container } = render(<HomePage />);
    const scripts = [
      ...container.querySelectorAll('script[type="application/ld+json"]'),
    ];
    const payload = scripts
      .map((script) => JSON.parse(script.innerHTML) as Record<string, unknown>)
      .find((data) => data["@type"] === "FAQPage") as
      | {
          mainEntity: { name: string; acceptedAnswer: { text: string } }[];
        }
      | undefined;

    expect(payload).toBeDefined();

    const faqHeading = [...container.querySelectorAll("h2")].find(
      (node) => node.textContent === home.faq.heading,
    );
    expect(faqHeading).toBeDefined();
    const section = faqHeading!.closest("section")!;
    const questions = [...section.querySelectorAll("h3")].map(
      (node) => node.textContent ?? "",
    );
    const answers = [...section.querySelectorAll("p")]
      .map((node) => node.textContent ?? "")
      .filter((text) => text.length > 0 && text !== "QUESTIONS");

    expect(payload!.mainEntity.map((item) => item.name)).toEqual(questions);
    expect(
      payload!.mainEntity.map((item) => item.acceptedAnswer.text),
    ).toEqual(answers);
    expect(questions).toEqual(home.faq.items.map((item) => item.q));
    expect(answers).toEqual(home.faq.items.map((item) => item.a));
  });

  it("links each city card to its service area page", () => {
    const { container } = render(<HomePage />);
    const hrefs = [
      ...container.querySelectorAll('a[href^="/service-areas/"]'),
    ].map((anchor) => anchor.getAttribute("href"));
    expect(hrefs).toEqual(
      home.areas.map((area) => `/service-areas/${area.slug}`),
    );
  });
});
