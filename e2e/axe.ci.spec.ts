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

  test("@ci /admin/sign-in has no serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/admin/sign-in");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoSeriousViolations(page, "/admin/sign-in");
  });

  // The existing admin pattern never completes OTP in CI, so the inbox and
  // lead detail pages redirect to sign in. Axe visits both admin routes and
  // scans that reachable bounce surface; a signed-in admin scan would need a
  // CI session helper (recorded as a follow-up in the phase 6 spec).
  test("@ci bounced /admin/inbox (sign-in) has no serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/admin/inbox");
    await expect(page).toHaveURL(/\/admin\/sign-in/);
    await expectNoSeriousViolations(page, "/admin/inbox → sign-in");
  });

  test("@ci bounced /admin/leads detail (sign-in) has no serious or critical violations", async ({
    page,
  }) => {
    await page.goto("/admin/leads/00000000-0000-0000-0000-000000001001");
    await expect(page).toHaveURL(/\/admin\/sign-in/);
    await expectNoSeriousViolations(page, "/admin/leads/<id> → sign-in");
  });
});
