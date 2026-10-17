import { test, expect } from "@playwright/test";

// A member of the STATIC "blaga" family (js/families.data.js). The picker for a
// static family is built entirely from that registry — no network — so seeding
// a still-valid cached session restores straight to the picker, hermetically.
const STATIC_FAMILY_SESSION = {
  accessToken: "test-token",
  expiresAt: Date.now() + 3600_000,
  email: "flaviusblaga@gmail.com",
  name: "Flavius",
};

test.beforeEach(async ({ page }) => {
  await page.route(
    /accounts\.google\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|www\.googleapis\.com/,
    (route) => route.abort()
  );
  await page.addInitScript((session) => {
    try {
      localStorage.setItem("engleza-familie:session", JSON.stringify(session));
    } catch { /* private mode — test will just land on login */ }
  }, STATIC_FAMILY_SESSION);
});

test("restores to the profile picker from a cached session", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/index.html");

  await expect(page.locator("#screen-profile-picker")).toBeVisible();
  await expect(page.locator("#profile-picker-list")).toContainText("Flavius");
  await expect(page.locator("#profile-picker-list")).toContainText("Darius");

  expect(errors, `uncaught page errors:\n${errors.join("\n")}`).toEqual([]);
});

test("does not eagerly load the Did-you-know fact bank at boot", async ({ page }) => {
  const requested = [];
  page.on("request", (req) => requested.push(req.url()));
  await page.goto("/index.html");
  await expect(page.locator("#screen-profile-picker")).toBeVisible();
  // The ~840-line fact bank is lazy-loaded only when "Did you know?" is opened,
  // so it must not be fetched during a normal boot.
  expect(requested.some((u) => u.includes("didyouknow.data.js"))).toBe(false);
});

test("avatar-picker dialog opens, then closes on Escape", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("#screen-profile-picker")).toBeVisible();

  await page.locator(".profile-avatar-edit").first().click();
  await expect(page.locator("#avatar-picker")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("#avatar-picker")).toBeHidden();
});
