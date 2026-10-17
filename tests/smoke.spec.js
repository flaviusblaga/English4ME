import { test, expect } from "@playwright/test";

// Smoke: the app boots to its (static) login screen with no uncaught JS errors.
// External origins (Google sign-in script, Google Fonts) are blocked so the run
// is hermetic and deterministic — the app must still render its login screen
// (sign-in itself needs Google, but booting must not).
test("boots to the login screen without JS errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(
    /accounts\.google\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.googleapis\.com/,
    (route) => route.abort()
  );

  await page.goto("/index.html");

  await expect(page.locator("#screen-login")).toBeVisible();
  await expect(page.locator(".wordmark")).toContainText("english");
  await expect(page.locator("#login-btn")).toBeVisible();

  expect(errors, `uncaught page errors:\n${errors.join("\n")}`).toEqual([]);
});
