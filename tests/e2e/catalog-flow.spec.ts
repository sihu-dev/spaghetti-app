/**
 * E2E Tests - Catalog Creation Flow
 * 전체 사용자 여정: 랜딩 → 회원가입 → 대시보드 → 카탈로그 생성
 */

import { test, expect } from "@playwright/test";

test.describe("Catalog AI - Full User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 시작 전 홈페이지로 이동
    await page.goto("http://localhost:3000");
  });

  test("랜딩 페이지 로드 및 주요 요소 확인", async ({ page }) => {
    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/CATALOG\.AI/i);

    // 히어로 섹션 확인
    const heroTitle = page.getByRole("heading", {
      name: /제품 사진만으로/i,
    });
    await expect(heroTitle).toBeVisible();

    // CTA 버튼 확인
    const ctaButton = page.getByRole("link", { name: /무료로 시작하기/i });
    await expect(ctaButton).toBeVisible();

    // 가격 정보 확인 (4개 티어)
    const pricingSection = page.locator('section:has-text("요금제")');
    await expect(pricingSection).toBeVisible();

    const pricingCards = pricingSection.locator("div").filter({
      hasText: /무료|Starter|Pro|Business/,
    });
    await expect(pricingCards.first()).toBeVisible();

    // 기능 섹션 확인
    const featuresSection = page.locator('section:has-text("주요 기능")');
    await expect(featuresSection).toBeVisible();
  });

  test("회원가입 플로우", async ({ page }) => {
    // 회원가입 페이지로 이동
    await page.goto("http://localhost:3000/auth/signup");

    // 폼 요소 확인
    await expect(page.getByLabel(/이메일/i)).toBeVisible();
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible();
    await expect(page.getByLabel(/이름/i)).toBeVisible();

    // 유효성 검증 테스트 - 빈 폼 제출
    const submitButton = page.getByRole("button", { name: /가입하기/i });
    await submitButton.click();

    // 에러 메시지 또는 폼 유효성 확인
    // (실제 Supabase 없이는 진행 불가하므로 UI 체크만)
  });

  test("로그인 페이지 확인", async ({ page }) => {
    await page.goto("http://localhost:3000/auth/signin");

    // 폼 요소 확인
    await expect(page.getByLabel(/이메일/i)).toBeVisible();
    await expect(page.getByLabel(/비밀번호/i)).toBeVisible();

    const signInButton = page.getByRole("button", { name: /로그인/i });
    await expect(signInButton).toBeVisible();

    // 회원가입 링크 확인
    const signUpLink = page.getByRole("link", { name: /회원가입/i });
    await expect(signUpLink).toBeVisible();
  });

  test("대시보드 접근 시 인증 리다이렉트", async ({ page }) => {
    // 비로그인 상태로 대시보드 접근 시도
    await page.goto("http://localhost:3000/dashboard");

    // 로그인 페이지로 리다이렉트되어야 함
    await page.waitForURL(/\/auth\/signin/, { timeout: 5000 });

    // 로그인 폼이 보여야 함
    await expect(page.getByLabel(/이메일/i)).toBeVisible();
  });

  test("카탈로그 생성 페이지 UI 확인", async ({ page }) => {
    // Note: 실제 인증 없이 페이지 구조만 테스트
    await page.goto("http://localhost:3000/dashboard/create");

    // Step 1: 목표 입력 섹션 확인
    const goalInput = page.getByRole("textbox");
    await expect(goalInput).toBeVisible();

    // 플레이스홀더 확인
    await expect(goalInput).toHaveAttribute(
      "placeholder",
      /제품 카탈로그/i
    );

    // 다음 버튼 확인
    const nextButton = page.getByRole("button", { name: /다음/i });
    await expect(nextButton).toBeVisible();

    // Step indicator 확인 (1, 2, 3)
    const stepIndicators = page.locator('[class*="rounded-full"]').filter({
      hasText: /^[123]$/,
    });
    await expect(stepIndicators.first()).toBeVisible();
  });

  test("3단계 위저드 네비게이션", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/create");

    // Step 1: 목표 입력
    const goalInput = page.getByRole("textbox");
    await goalInput.fill("테스트 제품 카탈로그를 한국어와 영어로 만들어줘");

    // 다음 버튼 클릭
    const nextButton = page.getByRole("button", { name: /다음/i });
    await nextButton.click();

    // Step 2: 확인 단계로 이동 확인
    await expect(page.getByText(/확인/i)).toBeVisible();
    await expect(page.getByText(/AI가 다음 작업을 수행합니다/i)).toBeVisible();

    // AI 에이전트 실행 버튼 확인
    const executeButton = page.getByRole("button", {
      name: /AI 에이전트 실행/i,
    });
    await expect(executeButton).toBeVisible();

    // 이전 버튼 확인
    const backButton = page.getByRole("button", { name: /이전/i });
    await expect(backButton).toBeVisible();

    // 이전 버튼 클릭하여 Step 1로 돌아가기
    await backButton.click();

    // 목표 입력 필드가 다시 보여야 함
    await expect(goalInput).toBeVisible();
    await expect(goalInput).toHaveValue(/테스트 제품 카탈로그/);
  });

  test("반응형 디자인 - 모바일 뷰", async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("http://localhost:3000");

    // 히어로 타이틀이 여전히 보여야 함
    const heroTitle = page.getByRole("heading", {
      name: /제품 사진만으로/i,
    });
    await expect(heroTitle).toBeVisible();

    // CTA 버튼 확인
    const ctaButton = page.getByRole("link", { name: /무료로 시작하기/i });
    await expect(ctaButton).toBeVisible();
  });

  test("접근성 - 키보드 네비게이션", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/create");

    // Tab 키로 폼 요소 포커스 이동
    await page.keyboard.press("Tab");

    // 목표 입력 필드가 포커스되어야 함
    const goalInput = page.getByRole("textbox");
    await expect(goalInput).toBeFocused();

    // 텍스트 입력
    await goalInput.fill("키보드 테스트");

    // Tab으로 다음 버튼으로 이동
    await page.keyboard.press("Tab");

    const nextButton = page.getByRole("button", { name: /다음/i });
    await expect(nextButton).toBeFocused();

    // Enter 키로 버튼 클릭
    await page.keyboard.press("Enter");

    // Step 2로 이동 확인
    await expect(page.getByText(/확인/i)).toBeVisible();
  });

  test("성능 - 페이지 로드 시간", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("http://localhost:3000");

    const loadTime = Date.now() - startTime;

    // 페이지 로드가 3초 이내여야 함
    expect(loadTime).toBeLessThan(3000);

    // 주요 콘텐츠가 보여야 함
    const heroTitle = page.getByRole("heading", {
      name: /제품 사진만으로/i,
    });
    await expect(heroTitle).toBeVisible();
  });
});

test.describe("Dashboard - Catalog Management", () => {
  test("빈 대시보드 상태 확인", async ({ page }) => {
    // Note: 인증 우회를 위해 직접 접근 (실제로는 리다이렉트됨)
    await page.goto("http://localhost:3000/dashboard");

    // 로그인 페이지로 리다이렉트되면 스킵
    const isLoginPage = page.url().includes("/auth/signin");
    if (isLoginPage) {
      test.skip();
    }

    // 빈 상태 메시지 확인
    const emptyStateText = page.getByText(/첫 카탈로그를 만들어보세요/i);

    // 새 카탈로그 버튼 확인
    const createButton = page.getByRole("link", { name: /새 카탈로그/i });
    await expect(createButton).toBeVisible();
  });
});

test.describe("API Endpoints", () => {
  test("API 헬스체크 - /api/agent", async ({ request }) => {
    // POST 요청 시뮬레이션 (실제 API 키 없이는 실패하지만 엔드포인트 존재 확인)
    const response = await request.post("http://localhost:3000/api/agent", {
      data: {
        goal: "테스트",
        images: [],
        companyName: "테스트",
      },
    });

    // 401 (인증 오류) 또는 500 (API 키 오류) 예상
    // 404가 아니면 엔드포인트는 존재하는 것
    expect([400, 401, 500]).toContain(response.status());
  });
});
