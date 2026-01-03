/**
 * Spaghetti AI - Landing Page
 * 미니멀 & 클린 - 핵심 메시지만
 */

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="font-bold text-xl tracking-tight">
            SPAGHETTI
          </Link>
          <Link href="/editor" className="rounded-full bg-[#1A1A1A] text-white text-sm px-5 py-2.5 hover:bg-[#333] transition-colors">
            시작하기
          </Link>
        </div>
      </header>

      {/* Hero Section - 심플하게 */}
      <section className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#1A1A1A] mb-6">
            이미지 한 장으로<br />
            <span className="text-[#5C6356]">디자인 시스템</span>을 만드세요
          </h1>
          <p className="text-lg text-[#666] mb-10 max-w-xl mx-auto">
            HCT 알고리즘이 브랜드 컬러를 추출하고,<br className="hidden sm:block" />
            100단계 컬러 토큰을 자동 생성합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/editor" className="inline-flex items-center justify-center rounded-full bg-[#1A1A1A] text-white px-8 py-4 text-base font-medium hover:bg-[#333] transition-colors">
              무료로 시작하기
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center rounded-full border-2 border-[#E0E0E0] text-[#1A1A1A] px-8 py-4 text-base font-medium hover:border-[#1A1A1A] transition-colors">
              기능 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Demo Preview - 시각적 증거 */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-3xl shadow-xl border border-[#E5E5E5] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
              </div>
              <span className="text-xs text-[#999] ml-2">spaghetti.app/editor</span>
            </div>
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Input */}
                <div className="space-y-4">
                  <div className="text-xs font-medium text-[#999] uppercase tracking-wider">Input</div>
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#5C6356] via-[#8B7355] to-[#C4B89E] flex items-center justify-center">
                    <div className="text-white/80 text-sm">브랜드 이미지</div>
                  </div>
                </div>
                {/* Output */}
                <div className="space-y-4">
                  <div className="text-xs font-medium text-[#999] uppercase tracking-wider">Output</div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {["#5C6356", "#6B7361", "#7A8172", "#8B9A7E", "#9DA88F"].map((color) => (
                        <div key={color} className="flex-1 aspect-square rounded-lg shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {["#C4B89E", "#D4C4A8", "#E4D4B8", "#F4E4C8", "#FFF8E8"].map((color) => (
                        <div key={color} className="flex-1 aspect-square rounded-lg shadow-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-3 font-mono text-xs text-[#666]">
                      --primary-500: #5C6356;
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - 3가지 핵심만 */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              왜 Spaghetti인가요?
            </h2>
            <p className="text-[#666]">디자인 시스템 구축의 반복 작업을 자동화합니다</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-olive/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">HCT 컬러 추출</h3>
              <p className="text-sm text-[#666] leading-relaxed">
                이미지에서 브랜드 컬러를 자동 추출하고<br />
                10단계 컬러 램프를 생성합니다
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-olive/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">토큰 자동 생성</h3>
              <p className="text-sm text-[#666] leading-relaxed">
                CSS Variables, Tailwind Config,<br />
                JSON 토큰을 원클릭으로 내보내기
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-olive/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">실시간 미리보기</h3>
              <p className="text-sm text-[#666] leading-relaxed">
                버튼, 입력폼, 카드 등<br />
                컴포넌트 스타일을 즉시 확인
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works - 단순 3단계 */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              3단계로 완성
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              { step: "1", title: "이미지 업로드", desc: "브랜드 이미지나 무드보드" },
              { step: "2", title: "컬러 선택", desc: "추출된 컬러 중 Primary 선택" },
              { step: "3", title: "내보내기", desc: "CSS, Tailwind, JSON 다운로드" },
            ].map((item, i) => (
              <div key={item.step} className="flex-1 text-center">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-[#1A1A1A] mb-1">{item.title}</h3>
                <p className="text-sm text-[#666]">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
                    <svg className="w-6 h-6 text-[#E0E0E0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-[#1A1A1A]">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-[#999] mb-8">
            무료로 첫 번째 디자인 시스템을 만들어 보세요
          </p>
          <Link href="/editor" className="inline-flex items-center justify-center rounded-full bg-white text-[#1A1A1A] px-8 py-4 text-base font-medium hover:bg-[#F5F5F5] transition-colors">
            에디터 열기
          </Link>
        </div>
      </section>

      {/* Footer - 미니멀 */}
      <footer className="py-12 px-6 bg-[#FAFAFA] border-t border-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <span className="font-bold text-lg">SPAGHETTI</span>
              <span className="text-sm text-[#999]">AI-powered Design System Generator</span>
            </div>
            <div className="text-sm text-[#999]">
              © 2025 Spaghetti AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
