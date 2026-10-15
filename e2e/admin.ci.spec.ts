import { expect, test } from "@playwright/test";

test.describe("@ci admin sign in (no session, no database writes)", () => {
  test("@ci renders the sign in screen with demo honesty", async ({ page }) => {
    await page.goto("/admin/sign-in");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Sign in with a code",
    );
    await expect(page.getByText("OWNER DESK")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Email me a code" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Fictional demo company. This desk is not a real service.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText("TACLB000000C · Dallas, TX · fictional placeholder license"),
    ).toBeVisible();
    // Admin routes are never indexed.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });

  test("@ci bounces a signed-out visitor off /admin/inbox", async ({
    page,
  }) => {
    await page.goto("/admin/inbox");

    await expect(page).toHaveURL(/\/admin\/sign-in\?next=%2Fadmin%2Finbox/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Sign in with a code",
    );
  });

  test("@ci shows the rate limit message on the fourth code request", async ({
    page,
  }) => {
    test.setTimeout(90_000);
    // Unique per project so parallel workers do not share the email window.
    const email = `ratelimit-${test.info().project.name}@apex.example`;
    const rateLimited = page.getByText(
      "Too many codes requested. Wait a few minutes and try again.",
    );
    const submit = page.getByRole("button", { name: "Email me a code" });

    for (let attempt = 0; attempt < 4; attempt++) {
      // Fresh load per attempt: the flow always boots on the email stage.
      await page.goto("/admin/sign-in");
      await page.getByLabel("Email").fill(email);
      await submit.click();

      // Terminal state: rate limited or send error (role=alert), or the code
      // stage when the provider accepts the request.
      await expect(
        page
          .getByRole("heading", { name: "Check your inbox" })
          .or(page.getByRole("alert"))
          .first(),
      ).toBeVisible({ timeout: 20_000 });

      if (await rateLimited.isVisible()) {
        break;
      }
    }

    await expect(rateLimited).toBeVisible();
  });
});
