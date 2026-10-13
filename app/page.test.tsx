import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("home page", () => {
  it("renders", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /page\.tsx/i }),
    ).toBeInTheDocument();
  });
});
