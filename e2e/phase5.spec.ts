import { expect, test, type Page } from "@playwright/test";

const routes: { path: string; h1: RegExp }[] = [
  { path: "/service-areas", h1: /six cities\. one office in dallas\./i },
  { path: "/service-areas/plano", h1: /serving plano\. the office stays in dallas\./i },
  { path: "/tips", h1: /seasonal checks, written down\./i },
  { path: "/reviews", h1: /what the demo inbox sounds like\./i },
  { path: "/privacy", h1: /what the form collects, in plain language\./i },
];

function watchConsole(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
}

for (const route of routes) {
  test(`@ci ${route.path} renders without console errors`, async ({ page }) => {
    const errors = watchConsole(page);
    await page.goto(route.path);
    await expect(page.locator("h1")).toContainText(route.h1);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}
