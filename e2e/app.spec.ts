import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /이미지 한 장으로/ })
    ).toBeVisible();
  });

  test("should have navigation to editor", async ({ page }) => {
    const editorLink = page.getByRole("link", { name: /시작하기/ }).first();
    await expect(editorLink).toBeVisible();
  });

  test("should display feature section", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /왜 Spaghetti인가요/ })
    ).toBeVisible();
    await expect(page.getByText(/HCT 컬러 추출/)).toBeVisible();
    await expect(page.getByText(/토큰 자동 생성/)).toBeVisible();
    await expect(page.getByText(/실시간 미리보기/)).toBeVisible();
  });

  test("should navigate to editor page", async ({ page }) => {
    await page.getByRole("link", { name: /무료로 시작하기/ }).click();
    await expect(page).toHaveURL("/editor");
  });
});

test.describe("Editor Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
  });

  test("should display the editor heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /이미지에서 컬러 추출/ })
    ).toBeVisible();
  });

  test("should display demo presets", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Olive/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Terracotta/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Ocean/ })).toBeVisible();
  });

  test("should select demo preset and show color ramp", async ({ page }) => {
    await page.getByRole("button", { name: /Olive/ }).click();

    // Wait for color ramp to appear
    await expect(page.getByText(/Primary/)).toBeVisible();
    await expect(page.getByText(/컬러 램프/)).toBeVisible();
  });

  test("should show preview tabs after selecting color", async ({ page }) => {
    await page.getByRole("button", { name: /Olive/ }).click();

    await expect(page.getByRole("button", { name: /버튼/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /입력폼/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /카드/ })).toBeVisible();
  });

  test("should switch between preview tabs", async ({ page }) => {
    await page.getByRole("button", { name: /Olive/ }).click();

    // Default is buttons tab
    await expect(page.getByText(/Solid/)).toBeVisible();

    // Switch to forms tab
    await page.getByRole("button", { name: /입력폼/ }).click();
    await expect(page.getByText(/이메일/)).toBeVisible();

    // Switch to cards tab
    await page.getByRole("button", { name: /카드/ }).click();
    await expect(page.getByText(/카드 타이틀/)).toBeVisible();
  });

  test("should toggle dark mode preview", async ({ page }) => {
    await page.getByRole("button", { name: /Olive/ }).click();

    // Go to darkmode tab
    await page.getByRole("button", { name: /다크모드/ }).click();

    // Toggle dark mode
    const toggle = page.locator("button.relative.w-14.h-7");
    await toggle.click();

    // Check that dark theme label appears
    await expect(page.getByText(/다크 테마/)).toBeVisible();
  });

  test("should reset editor", async ({ page }) => {
    await page.getByRole("button", { name: /Olive/ }).click();
    await page.getByRole("button", { name: /초기화/ }).click();

    // Should return to initial state
    await expect(
      page.getByRole("heading", { name: /이미지에서 컬러 추출/ })
    ).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /이미지 한 장으로/ })
    ).toBeVisible();
  });

  test("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/editor");

    await expect(
      page.getByRole("heading", { name: /이미지에서 컬러 추출/ })
    ).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
  });

  test("should have accessible buttons", async ({ page }) => {
    await page.goto("/editor");

    const buttons = page.getByRole("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});
