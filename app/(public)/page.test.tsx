import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(public)/page";

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
});
