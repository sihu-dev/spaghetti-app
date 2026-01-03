/**
 * Create Catalog - AI Wizard
 * 3단계 카탈로그 생성 마법사
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, Sparkles, Check, Upload } from "lucide-react";

type Step = 1 | 2 | 3;

export default function CreateCatalogPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Step 1: Goal
  const [goal, setGoal] = useState("제품 카탈로그를 한국어와 영어로 만들어줘");

  // Step 2: Images (Simulated)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Step 3: Result
  const [result, setResult] = useState<any>(null);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep(3);

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 300);

      // AI Agent 호출
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          images: [
            "https://via.placeholder.com/800x600/2563EB/FFFFFF?text=Product+1",
            "https://via.placeholder.com/800x600/10B981/FFFFFF?text=Product+2",
          ],
          logo: "https://via.placeholder.com/200x200/1A1A1A/FFFFFF?text=LOGO",
          companyName: "한국제조",
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error("Failed to generate catalog");
      }

      const data = await response.json();
      setResult(data.data);

      // Supabase에 저장
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 크레딧 사용
        await supabase.rpc("use_credit", {
          catalog_id_param: null, // 임시
        });

        // 카탈로그 저장
        const { data: catalogData } = await supabase
          .from("catalogs")
          .insert({
            user_id: user.id,
            title: data.data.catalogData?.title || "새 카탈로그",
            company_name: data.data.catalogData?.companyName || "회사명",
            product_count: data.data.products?.length || 0,
            language: data.data.catalogData?.language || ["ko"],
            status: "completed",
            pdf_url: data.data.pdfUrl,
          })
          .select()
          .single();

        console.log("Catalog saved:", catalogData);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("카탈로그 생성 중 오류가 발생했습니다");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로
          </Link>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Step 1: Goal */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              어떤 카탈로그를 만들까요?
            </h2>
            <p className="text-gray-600 mb-6">
              자연어로 목표를 입력하세요. AI가 이해하고 자동으로 생성합니다.
            </p>

            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none resize-none text-gray-900"
              rows={4}
              placeholder='예: "펌프 제품 카탈로그를 영어와 한국어로 만들어줘"'
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!goal.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                다음
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">확인</h2>
            <p className="text-gray-600 mb-6">AI가 다음 작업을 수행합니다:</p>

            <div className="space-y-4 mb-8">
              {[
                "제품 사진에서 스펙 자동 추출",
                "로고에서 브랜드 컬러 인식",
                "산업별 템플릿 자동 선택",
                "다국어 자동 번역",
                "전문 PDF 카탈로그 생성",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-900">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>목표:</strong> {goal}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                이전
              </button>

              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                AI 에이전트 실행
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating / Result */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {isGenerating && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(59, 130, 246, 0.1)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 2.83} 283`}
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  AI가 카탈로그를 생성하고 있습니다
                </h2>
                <p className="text-gray-600">
                  제품 정보를 추출하고 템플릿을 적용하는 중...
                </p>
              </div>
            )}

            {!isGenerating && result && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">완료!</h2>
                    <p className="text-gray-600">
                      카탈로그가 성공적으로 생성되었습니다
                    </p>
                  </div>
                </div>

                {result.pdfUrl && (
                  <a
                    href={result.pdfUrl}
                    download
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all mb-6"
                  >
                    <Upload className="w-5 h-5" />
                    PDF 다운로드
                  </a>
                )}

                <div className="flex gap-4">
                  <Link
                    href="/dashboard/create"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  >
                    새 카탈로그
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
                  >
                    대시보드로
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
