/**
 * Catalog AI - New Landing Page
 * Supabase 스타일 벤치마킹
 */

import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Globe, Palette, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
            CATALOG<span className="text-blue-600">.AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              기능
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              가격
            </Link>
            <Link href="#examples" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              사례
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-sm"
            >
              무료로 시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI 카탈로그 자동 생성
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              제품 사진 → 전문 카탈로그
              <br />
              <span className="text-blue-600">단 5분</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              AI가 제품 스펙 추출 + 브랜드 컬러 분석 + 다국어 번역까지
              <br />
              중소 제조업체를 위한 카탈로그 자동 생성 플랫폼
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30"
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                데모 보기
              </Link>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-gray-500">
              ✨ 이미 <span className="font-bold text-gray-900">1,000+</span> 카탈로그 생성 완료
            </p>
          </div>

          {/* Demo Video/Image Placeholder */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">데모 영상 (추후 추가)</p>
                <p className="text-sm text-gray-500">제품 업로드 → AI 분석 → PDF 생성</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              카탈로그 제작, 이제 이렇게 간단합니다
            </h2>
            <p className="text-lg text-gray-600">
              기존 방식과 비교해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-red-600 font-bold text-sm mb-4">기존 방식</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                디자이너 외주
              </h3>

              <div className="space-y-4 mb-8">
                {[
                  "제품 촬영 (1일)",
                  "엑셀에 스펙 수기 입력 (4시간)",
                  "디자이너 섭외 + 견적 (3일)",
                  "디자인 작업 (1~2주)",
                  "피드백 + 수정 (3일)",
                  "영문 번역 추가 (+1주)",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-600">
                    <span className="text-red-500">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₩100만</span>
                  <span className="text-gray-600">+ 2~3주</span>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-600 relative">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                NEW
              </div>

              <div className="text-blue-600 font-bold text-sm mb-4">Catalog.AI</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                AI 자동 생성
              </h3>

              <div className="space-y-4 mb-8">
                {[
                  "로고 업로드 → 브랜드 컬러 추출 (5초)",
                  "제품 사진 업로드 (1분)",
                  "AI가 스펙 자동 추출 (30초)",
                  "템플릿 자동 적용 (즉시)",
                  "다국어 자동 번역 (1분)",
                  "PDF 다운로드 (즉시)",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-gray-900">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-blue-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">₩4,000</span>
                  <span className="text-gray-600">/ 카탈로그 + 5분</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">96% 비용 절감 + 99% 시간 단축</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI가 모든 걸 자동화합니다
            </h2>
            <p className="text-lg text-gray-600">
              제품 사진만 있으면 됩니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "AI 스펙 추출",
                description: "제품 명판에서 모델명, 전압, 용량 등을 자동으로 읽어냅니다",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600",
              },
              {
                icon: <Palette className="w-6 h-6" />,
                title: "브랜드 컬러 인식",
                description: "로고에서 브랜드 컬러를 추출하여 카탈로그 전체에 일관성 있게 적용합니다",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "다국어 자동 번역",
                description: "한국어 → 영어/중국어/일본어로 전문 용어를 정확하게 번역합니다",
                iconBg: "bg-green-100",
                iconColor: "text-green-600",
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: "산업별 템플릿",
                description: "펌프, 밸브, 모터 등 산업별로 최적화된 템플릿을 제공합니다",
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600",
              },
              {
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: "1클릭 PDF 생성",
                description: "인쇄용 고해상도 PDF를 즉시 다운로드할 수 있습니다",
                iconBg: "bg-red-100",
                iconColor: "text-red-600",
              },
              {
                icon: <ArrowRight className="w-6 h-6" />,
                title: "실시간 수정",
                description: "웹 에디터에서 언제든 가격, 스펙, 이미지를 즉시 수정할 수 있습니다",
                iconBg: "bg-indigo-100",
                iconColor: "text-indigo-600",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center ${feature.iconColor} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              3단계로 완성
            </h2>
            <p className="text-lg text-gray-600">
              복잡한 설정 없이 바로 시작하세요
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "로고 + 제품 사진 업로드",
                description: "회사 로고와 제품 사진을 드래그 앤 드롭으로 업로드하세요. AI가 즉시 브랜드 컬러와 제품 정보를 추출합니다.",
              },
              {
                step: "2",
                title: "AI 자동 분석",
                description: "제품 명판에서 모델명, 스펙, 특징을 자동으로 읽어냅니다. 잘못 인식된 부분만 수정하면 됩니다.",
              },
              {
                step: "3",
                title: "카탈로그 다운로드",
                description: "산업별 템플릿이 자동으로 적용되고, 원하는 언어로 번역된 PDF를 즉시 다운로드할 수 있습니다.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-lg text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              크레딧 충전식 요금제
            </h2>
            <p className="text-lg text-gray-600">
              필요한 만큼만 충전하고 사용하세요 · 유효기간 1년
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Free Trial */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">체험</div>
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">무료</div>
                <div className="text-sm text-gray-600">3 크레딧</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  카탈로그 3개 생성
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  기본 템플릿
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  한/영 번역
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full block text-center px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                시작하기
              </Link>
            </div>

            {/* Starter */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">스타터</div>
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">₩50,000</div>
                <div className="text-sm text-gray-600">10 크레딧</div>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 mb-6">
                크레딧당 ₩5,000
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  카탈로그 10개
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  모든 템플릿
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  3개 언어 번역
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  이메일 지원
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full block text-center px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
              >
                충전하기
              </Link>
            </div>

            {/* Pro - Popular */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 border-2 border-blue-600 relative transform scale-105 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-yellow-400 text-yellow-900 text-xs font-bold">
                인기
              </div>
              <div className="text-sm font-bold text-blue-100 uppercase tracking-wider mb-2">프로</div>
              <div className="mb-4">
                <div className="text-4xl font-bold text-white mb-1">₩200,000</div>
                <div className="text-sm text-blue-100">50 크레딧</div>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-medium text-white mb-6">
                크레딧당 ₩4,000 · 20% 할인
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                  카탈로그 50개
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                  모든 템플릿
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                  5개 언어 번역
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                  우선 지원
                </li>
                <li className="flex items-center gap-2 text-sm text-white">
                  <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                  배경 제거 무료
                </li>
              </ul>
              <Link
                href="/auth/signup"
                className="w-full block text-center px-6 py-3 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-100 transition-all shadow-lg"
              >
                충전하기
              </Link>
            </div>

            {/* Business */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">비즈니스</div>
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-1">₩350,000</div>
                <div className="text-sm text-gray-600">100 크레딧</div>
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-xs font-medium text-green-700 mb-6">
                크레딧당 ₩3,500 · 30% 할인
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  카탈로그 100개
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  커스텀 템플릿
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  무제한 언어
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  전담 매니저
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  API 접근
                </li>
              </ul>
              <Link
                href="/contact"
                className="w-full block text-center px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
              >
                문의하기
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">
              💳 모든 결제는 <span className="font-medium text-gray-900">토스페이먼츠</span>로 안전하게 처리됩니다
            </p>
            <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                크레딧 유효기간 1년
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                부가세 포함
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                환불 정책 7일
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              신용카드 등록 없이 무료 크레딧으로 체험해보세요
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 text-lg font-bold hover:bg-gray-100 transition-all shadow-xl"
            >
              무료 크레딧 받기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-900">CATALOG.AI</span>
              <span className="text-sm text-gray-500">
                중소 제조업체를 위한 AI 카탈로그 생성 플랫폼
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/docs">문서</Link>
              <Link href="/blog">블로그</Link>
              <Link href="/support">고객지원</Link>
              <span>© 2026 Catalog AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
