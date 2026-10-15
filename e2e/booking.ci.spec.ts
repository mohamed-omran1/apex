import { expect, test } from "@playwright/test";

test.describe("@ci booking form (no database writes)", () => {
  test("@ci renders the booking flow", async ({ page }) => {
    await page.goto("/book");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Under a minute, on a desk too.",
    );
    // Four kind cards, membership_enquiry has no card (arrives via ?type=).
    await expect(page.locator('input[name="kind"]')).toHaveCount(4);
    // Steps rail: ZIP, kind, details.
    await expect(page.locator("ol li")).toHaveCount(3);
    await expect(page.locator("ol li").nth(0)).toContainText("ZIP");
    await expect(page.locator("ol li").nth(2)).toContainText("Details");
    await expect(
      page.getByRole("button", { name: "Request the repair" }),
    ).toBeVisible();
    await expect(page.getByRole("group", { name: "What do you need?" })).toBeVisible();
  });

  test("@ci empty submit shows client errors without sending", async ({
    page,
  }) => {
    await page.goto("/book");

    await page.getByRole("button", { name: "Request the repair" }).click();

    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toHaveText("Fix 4 fields, then send.");
    await expect(page.locator("#name-error")).toBeVisible();
    await expect(page.locator("#phone-error")).toBeVisible();
    await expect(page.getByRole("button", { name: "Fix and send" })).toBeVisible();
    // Focus moved to the first invalid field.
    await expect(page.locator('input[name="name"]')).toBeFocused();
  });

  test("@ci kind switching changes the field set", async ({ page }) => {
    await page.goto("/book");

    await expect(page.locator('input[name="address"]')).toBeVisible();
    await expect(page.locator('input[name="preferred_window"]')).toHaveCount(4);

    await page.locator('label:has(input[name="kind"][value="emergency"])').click();

    await expect(
      page.getByRole("button", { name: "Send the short form" }),
    ).toBeVisible();
    await expect(page.locator('input[name="address"]')).toHaveCount(0);
    await expect(page.locator('input[name="email"]')).toHaveCount(0);
    await expect(page.locator('input[name="preferred_window"]')).toHaveCount(0);
    await expect(page.locator('textarea[name="issue"]')).toBeVisible();
    await expect(page.getByText("What is going on?")).toBeVisible();

    await page.locator('label:has(input[name="kind"][value="estimate"])').click();

    await expect(page.locator('input[name="address"]')).toBeVisible();
    await expect(page.locator('input[name="preferred_window"]')).toHaveCount(4);
    await expect(
      page.getByRole("button", { name: "Request the estimate" }),
    ).toBeVisible();
  });

  test("@ci out of area zip warns but never blocks", async ({ page }) => {
    await page.goto("/book");

    await page.locator('input[name="zip"]').fill("78701");

    await expect(
      page.getByText(
        "78701 is outside Dallas–Fort Worth. Leave the number anyway, or try another ZIP.",
      ),
    ).toBeVisible();
    const call = page.getByRole("link", { name: "Call (214) 555-0148" }).first();
    await expect(call).toHaveAttribute("href", "tel:+12145550148");
    await expect(
      page.getByRole("button", { name: "Request the repair" }),
    ).toBeEnabled();
    await expect(
      page.locator("ol li").nth(0),
    ).toContainText("78701 is outside the drive");
  });

  test("@ci honeypot is hidden from people", async ({ page }) => {
    await page.goto("/book");

    const honeypot = page.locator('input[name="company"]');
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
    await expect(honeypot).toHaveAttribute("autocomplete", "off");
    const wrapper = page.locator('div[aria-hidden="true"]').filter({
      has: honeypot,
    });
    await expect(wrapper).toHaveCount(1);
    const box = await honeypot.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThan(0);
  });

  test("@ci window chips are labelled radios", async ({ page }) => {
    await page.goto("/book");

    const group = page.locator("fieldset").filter({
      has: page.locator('input[name="preferred_window"]'),
    });
    await expect(group.locator("legend")).toHaveText("Window");
    await expect(
      group.locator('input[name="preferred_window"]'),
    ).toHaveCount(4);

    await group.locator('label:has(input[value="morning"])').click();
    await expect(
      page.locator('input[name="preferred_window"][value="morning"]'),
    ).toBeChecked();
    await expect(
      page.locator('input[name="preferred_window"][value="asap"]'),
    ).not.toBeChecked();
  });

  test("@ci ?type= selects the kind from the URL", async ({ page }) => {
    await page.goto("/book?type=estimate");

    await expect(
      page.locator('input[name="kind"][value="estimate"]'),
    ).toBeChecked();
    await expect(
      page.getByRole("button", { name: "Request the estimate" }),
    ).toBeVisible();
  });
});
