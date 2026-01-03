/**
 * AI Agent Demo Page
 * 자율 실행 시스템 테스트
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Upload, Check } from "lucide-react";

export default function AgentDemoPage() {
  const [goal, setGoal] = useState("펌프 제품 카탈로그를 영어와 한국어로 만들어줘");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setIsRunning(true);
    setProgress(0);
    setError("");
    setResult(null);

    try {
      // 데모용 이미지 URL (실제로는 업로드 필요)
      const demoImages = [
        "https://via.placeholder.com/800x600/2563EB/FFFFFF?text=Pump+KP-500A",
        "https://via.placeholder.com/800x600/10B981/FFFFFF?text=Pump+KP-600B",
      ];

      const demoLogo = "https://via.placeholder.com/200x200/1A1A1A/FFFFFF?text=LOGO";

      // 진행 상태 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          images: demoImages,
          logo: demoLogo,
          companyName: "한국펌프",
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run agent");
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI 에이전트 데모
              </h1>
              <p className="text-gray-600">
                목표만 입력하면 AI가 전체 프로세스를 자동 수행합니다
              </p>
            </div>
          </div>
        </div>

        {/* Goal Input */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-3">
            목표 입력 (자연어로 입력하세요)
          </label>

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-600 focus:outline-none resize-none text-gray-900"
            rows={3}
            placeholder='예: "펌프 제품 카탈로그를 영어와 한국어로 만들어줘"'
          />

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleRun}
              disabled={isRunning || !goal.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isRunning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  실행 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI 에이전트 실행
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-900">진행 중...</span>
                <span className="text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {currentStep && (
              <p className="text-sm text-gray-600">
                현재 단계: {currentStep}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <p className="text-red-800 font-medium mb-2">오류 발생</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">완료!</h2>
                <p className="text-sm text-gray-600">
                  AI 에이전트가 카탈로그를 생성했습니다
                </p>
              </div>
            </div>

            {/* Products */}
            {result.products && result.products.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  추출된 제품 정보 ({result.products.length}개)
                </h3>
                <div className="space-y-3">
                  {result.products.map((product: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.modelName || "모델명 미확인"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {product.category || "카테고리 미확인"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.confidence === "high"
                              ? "bg-green-100 text-green-700"
                              : product.confidence === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {product.confidence}
                        </span>
                      </div>

                      {product.specifications &&
                        Object.keys(product.specifications).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">스펙</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(product.specifications).map(
                                ([key, value]: [string, any]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 rounded bg-white border border-gray-200 text-xs text-gray-700"
                                  >
                                    {key}: {JSON.stringify(value)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Colors */}
            {result.brandColors && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  브랜드 컬러
                </h3>
                <div className="flex gap-3">
                  <div>
                    <div
                      className="w-20 h-20 rounded-xl shadow-lg"
                      style={{ backgroundColor: result.brandColors.primary }}
                    />
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Primary
                    </p>
                  </div>
                  {result.brandColors.palette &&
                    result.brandColors.palette
                      .slice(1, 5)
                      .map((color: string, idx: number) => (
                        <div key={idx}>
                          <div
                            className="w-16 h-16 rounded-xl shadow-md"
                            style={{ backgroundColor: color }}
                          />
                          <p className="text-xs text-gray-600 mt-2 text-center">
                            {color}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            )}

            {/* Catalog Data */}
            {result.catalogData && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  카탈로그 정보
                </h3>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">제목:</span>{" "}
                    <span className="text-gray-900 font-medium">
                      {result.catalogData.title}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">회사:</span>{" "}
                    <span className="text-gray-900 font-medium">
                      {result.catalogData.companyName}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">언어:</span>{" "}
                    <span className="text-gray-900 font-medium">
                      {result.catalogData.language.join(", ")}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* PDF Link */}
            {result.pdfUrl && (
              <a
                href={result.pdfUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
              >
                <Upload className="w-5 h-5" />
                PDF 다운로드
              </a>
            )}
          </div>
        )}

        {/* Examples */}
        <div className="mt-8 p-6 rounded-2xl bg-blue-50 border border-blue-100">
          <h3 className="font-medium text-blue-900 mb-3">
            사용 예시 (클릭하여 입력)
          </h3>
          <div className="space-y-2">
            {[
              "펌프 제품 카탈로그를 영어와 한국어로 만들어줘",
              "밸브 카탈로그를 만들고 중국어 번역도 포함해줘",
              "산업용 모터 카탈로그를 전문적인 스타일로 만들어줘",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setGoal(example)}
                className="block w-full text-left px-4 py-2 rounded-lg bg-white hover:bg-blue-100 text-sm text-blue-900 transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
