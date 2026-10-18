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

test("super-admin lands on the section hub and can drill into a group", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/index.html");

  // The seeded account (flaviusblaga@gmail.com) is a super-admin, so it lands on
  // the sectioned hub (Adult / Teens / Kids / Admin), NOT the member tiles.
  await expect(page.locator("#screen-profile-picker")).toBeVisible();
  await expect(page.locator(".section-card--adult")).toBeVisible();
  await expect(page.locator(".section-card--kid")).toBeVisible();
  await expect(page.locator(".section-card--admin")).toBeVisible();
  // Members are not shown until a section is opened.
  await expect(page.locator("#profile-picker-list")).not.toContainText("Flavius");

  // Drilling into Adult reveals the adult member(s); Back returns to the hub,
  // and Kids reveals the children.
  await page.locator(".section-card--adult").click();
  await expect(page.locator("#profile-picker-list")).toContainText("Flavius");
  await page.locator(".section-back").click();
  await expect(page.locator(".section-card--kid")).toBeVisible();
  await page.locator(".section-card--kid").click();
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

test("does not eagerly load the Advanced/Expert grammar banks at boot", async ({ page }) => {
  const requested = [];
  page.on("request", (req) => requested.push(req.url()));
  await page.goto("/index.html");
  await expect(page.locator("#screen-profile-picker")).toBeVisible();
  // grammar-extra.js + grammar-extra2.js are ~91 KB of Advanced/Expert/Teen
  // question banks, lazy-loaded (lesson-structure.js ensureGrammarExtras) only
  // when one of those tiers is entered. A Beginner/Intermediate boot — and the
  // picker itself — must never fetch them.
  expect(requested.some((u) => u.includes("grammar-extra.js"))).toBe(false);
  expect(requested.some((u) => u.includes("grammar-extra2.js"))).toBe(false);
});

test("avatar-picker dialog opens, then closes on Escape", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("#screen-profile-picker")).toBeVisible();

  // Member tiles (and their "change picture" edit badge) live inside a hub
  // section for the super-admin, so open the Adults section first.
  await page.locator(".section-card--adult").click();
  await page.locator(".profile-avatar-edit").first().click();
  await expect(page.locator("#avatar-picker")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator("#avatar-picker")).toBeHidden();
});
