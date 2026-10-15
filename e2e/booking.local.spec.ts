import { expect, test } from "@playwright/test";

/**
 * Full end-to-end submit against the linked Supabase project. Reserved 555
 * numbers only. Runs at the local gate (`--grep @local`), never in CI.
 */
test.describe("@local full lead submit", () => {
  test("@local emergency lead lands and the resubmit is deduplicated", async ({
    page,
  }) => {
    await page.goto("/book?type=emergency");

    await page.locator('input[name="name"]').fill("E2E Local Test");
    await page.locator('input[name="phone"]').fill("(214) 555-0188");
    await page.locator('input[name="zip"]').fill("75204");
    await page.locator('textarea[name="issue"]').fill(
      "Local gate submit — no cool air upstairs. Safe to ignore.",
    );

    await page.getByRole("button", { name: "Send the short form" }).click();

    await expect(page.getByText("REQUEST IN")).toBeVisible();
    const reference = page.getByText(/^APX-[A-HJ-NP-Z2-9]{6}$/);
    await expect(reference).toBeVisible();
    const firstCode = (await reference.first().textContent())?.trim();
    expect(firstCode).toMatch(/^APX-[A-HJ-NP-Z2-9]{6}$/);

    // Same phone within ten minutes: duplicate guard returns the same code.
    await page.getByRole("button", { name: "Send another request" }).click();

    await page.locator('input[name="name"]').fill("E2E Local Test");
    await page.locator('input[name="phone"]').fill("(214) 555-0188");
    await page.locator('input[name="zip"]').fill("75204");
    await page.locator('textarea[name="issue"]').fill(
      "Local gate resubmit — should deduplicate.",
    );
    await page.getByRole("button", { name: "Send the short form" }).click();

    await expect(page.getByText("ALREADY IN")).toBeVisible();
    await expect(
      page.getByText(new RegExp(`reference stays ${firstCode}`)),
    ).toBeVisible();
  });
});
