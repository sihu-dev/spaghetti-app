/**
 * Spaghetti AI - Landing Page
 * 랜딩에서 바로 서비스 사용 가능
 */

import Link from "next/link";
import { ColorExtractor } from "@/components/landing/ColorExtractor";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-sm border-b border-[#E5E5E5]/50">
        <div className="container mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            SPAGHETTI
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/editor"
              className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors"
            >
              고급 에디터
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#666] hover:text-[#1A1A1A] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Hero + Interactive Demo */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Hero Text */}
            <div className="lg:sticky lg:top-24">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[#1A1A1A] mb-5">
                이미지 한 장으로
                <br />
                <span className="text-[#5C6356]">디자인 시스템</span> 생성
              </h1>
              <p className="text-lg text-[#666] mb-8">
                Material Design 3의 HCT 알고리즘으로
                <br />
                브랜드 컬러를 추출하고 토큰을 자동 생성합니다.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-8">
                {[
                  "K-Means++ 클러스터링으로 정확한 색상 추출",
                  "11단계 컬러 스케일 (50-950) 자동 생성",
                  "CSS Variables, Tailwind, JSON 내보내기",
                  "Light/Dark 테마 자동 생성",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#5C6356]/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-[#5C6356]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-[#666]">{feature}</span>
                  </div>
                ))}
              </div>

              {/* MCP Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A] text-white text-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                MCP 서버 지원
              </div>
            </div>

            {/* Right: Interactive Demo */}
            <div className="bg-white rounded-3xl shadow-xl border border-[#E5E5E5] p-6 md:p-8">
              <ColorExtractor />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1A1A1A] mb-12">
            작동 원리
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "이미지 업로드",
                desc: "브랜드 로고, 무드보드, 또는 원하는 이미지",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                ),
              },
              {
                step: "2",
                title: "HCT 색상 추출",
                desc: "K-Means++ 알고리즘으로 주요 색상 자동 분석",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                  />
                ),
              },
              {
                step: "3",
                title: "토큰 내보내기",
                desc: "CSS, Tailwind, JSON 형식으로 원클릭 다운로드",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#5C6356]/10 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-[#5C6356]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    {item.icon}
                  </svg>
                </div>
                <div className="text-xs text-[#5C6356] font-medium mb-2">
                  STEP {item.step}
                </div>
                <h3 className="font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                <p className="text-sm text-[#666]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MCP Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-[#1A1A1A] rounded-3xl p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Model Context Protocol
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              AI와 함께 사용하세요
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Claude Desktop에 MCP 서버를 연결하면
              <br />
              대화로 디자인 시스템을 생성할 수 있습니다.
            </p>

            <div className="bg-white/5 rounded-xl p-4 max-w-md mx-auto mb-6">
              <code className="text-sm text-white/80 font-mono">
                npx @spaghetti-ai/mcp-server
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#1A1A1A] text-sm font-medium hover:bg-white/90 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>
              <Link
                href="/editor"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                고급 에디터 열기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[#1A1A1A] mb-12">
            주요 기능
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "HCT 색상 과학",
                desc: "Material Design 3의 Hue-Chroma-Tone 색공간 사용",
              },
              {
                title: "WCAG 접근성",
                desc: "자동 대비율 검사 및 AA/AAA 레벨 확인",
              },
              {
                title: "Dark Mode",
                desc: "Light/Dark 테마 자동 생성 및 미리보기",
              },
              {
                title: "Tailwind 지원",
                desc: "Tailwind CSS v4 설정 파일 자동 생성",
              },
              {
                title: "Figma 토큰",
                desc: "Figma Variables 형식으로 내보내기",
              },
              {
                title: "MCP 통합",
                desc: "Claude Desktop과 연동하여 AI로 생성",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors"
              >
                <h3 className="font-bold text-[#1A1A1A] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#666]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[#E5E5E5]">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold">SPAGHETTI</span>
              <span className="text-sm text-[#999]">
                AI Design System Generator
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#999]">
              <a href="https://github.com" className="hover:text-[#1A1A1A]">
                GitHub
              </a>
              <span>© 2025 Spaghetti AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
