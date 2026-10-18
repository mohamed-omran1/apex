import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/services",
  "/services/ac-repair",
  "/service-areas",
  "/service-areas/dallas",
  "/book",
  "/reviews",
];

async function expectNoSeriousViolations(
  page: import("@playwright/test").Page,
  context: string,
) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );

  const summary = blocking
    .map(
      (violation) =>
        `${violation.id} (${violation.impact}): ${violation.help}\n` +
        violation.nodes.map((node) => `  ${node.target.join(" ")}`).join("\n"),
    )
    .join("\n");

  expect(summary, `${context}: serious or critical axe violations`).toBe("");
}

test.describe("@ci axe (wcag2aa, serious and critical)", () => {
  for (const route of publicRoutes) {
    test(`@ci ${route} has no serious or critical violations`, async ({
      page,
    }) => {
      await page.goto(route);
      await expectNoSeriousViolations(page, route);
    });
  }

  // The existing admin pattern never completes OTP in CI, so the inbox and
  // lead detail redirect to sign in. Axe runs on that reachable admin surface.
  test("@ci /admin/sign-in has no serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/admin/sign-in");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoSeriousViolations(page, "/admin/sign-in");
  });

  test("@ci bounced /admin/inbox (sign-in) has no serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/admin/inbox");
    await expect(page).toHaveURL(/\/admin\/sign-in/);
    await expectNoSeriousViolations(page, "/admin/inbox → sign-in");
  });
});
