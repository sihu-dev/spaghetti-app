/**
 * Spaghetti AI - Editor Page
 * Phase 1: Accessibility + Dark Mode
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import Link from "next/link";
import {
  extractColorsFromImage,
  selectPrimaryColor,
  type ExtractedColor,
} from "@/lib/color/extraction";
import {
  generateColorRamp,
  colorScaleToRecord,
  type ColorScale,
} from "@/lib/color/ramp";
import {
  downloadCssVariables,
  downloadTailwindConfig,
  type ExportData,
} from "@/lib/export";
import { generateDesignSystemZip, type TokenContext } from "@/lib/codegen";
import { getContrastRatio, getWCAGLevel } from "@/lib/color/accessibility";
import {
  generateThemePalette,
  exportThemeAsCSS,
  type ThemePalette,
} from "@/lib/color/darkmode";
import { DEMO_PRESETS } from "@/config/presets";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

type PreviewTab = "buttons" | "forms" | "cards";
type SidebarTab = "colors" | "accessibility" | "darkmode";

export default function EditorPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [colorRamp, setColorRamp] = useState<ColorScale | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("buttons");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("colors");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [previewDarkMode, setPreviewDarkMode] = useState(false);

  // 테마 팔레트 생성
  const themePalette = useMemo<ThemePalette | null>(() => {
    if (!selectedColor) return null;
    return generateThemePalette(selectedColor);
  }, [selectedColor]);

  // 접근성 매트릭스 계산
  const accessibilityData = useMemo(() => {
    if (!colorRamp) return null;

    const checks = [
      { name: "500 on White", fg: colorRamp["500"], bg: "#FFFFFF" },
      { name: "White on 500", fg: "#FFFFFF", bg: colorRamp["500"] },
      { name: "500 on 50", fg: colorRamp["500"], bg: colorRamp["50"] },
      { name: "900 on 100", fg: colorRamp["900"], bg: colorRamp["100"] },
      { name: "100 on 900", fg: colorRamp["100"], bg: colorRamp["900"] },
      { name: "700 on White", fg: colorRamp["700"], bg: "#FFFFFF" },
    ];

    return checks.map((check) => ({
      ...check,
      result: getWCAGLevel(getContrastRatio(check.fg, check.bg)),
    }));
  }, [colorRamp]);

  // CSS Variables
  const dynamicStyles = useMemo(() => {
    if (!selectedColor || !colorRamp) return {};
    return {
      "--color-primary": selectedColor,
      "--color-primary-50": colorRamp["50"],
      "--color-primary-100": colorRamp["100"],
      "--color-primary-200": colorRamp["200"],
      "--color-primary-300": colorRamp["300"],
      "--color-primary-400": colorRamp["400"],
      "--color-primary-500": colorRamp["500"],
      "--color-primary-600": colorRamp["600"],
      "--color-primary-700": colorRamp["700"],
      "--color-primary-800": colorRamp["800"],
      "--color-primary-900": colorRamp["900"],
    } as React.CSSProperties;
  }, [selectedColor, colorRamp]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsDemoMode(false);
    const oversizedFiles = acceptedFiles.filter(
      (f) => f.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) return;

    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);

    if (newImages.length > 0) {
      await autoExtractColors(newImages[0].preview);
    }
  }, []);

  const autoExtractColors = async (imageUrl: string) => {
    setIsExtracting(true);
    setExtractProgress(0);
    setExtractError(null);

    const progressInterval = setInterval(() => {
      setExtractProgress((prev) =>
        prev >= 90 ? prev : prev + Math.random() * 15,
      );
    }, 200);

    try {
      const colors = await extractColorsFromImage(imageUrl, { colorCount: 8 });
      clearInterval(progressInterval);
      setExtractProgress(100);

      setTimeout(() => {
        if (colors.length === 0) {
          setExtractError("이미지에서 색상을 찾을 수 없습니다");
          setIsExtracting(false);
          return;
        }
        setExtractedColors(colors);
        const primaryCandidate = selectPrimaryColor(colors);
        if (primaryCandidate) {
          setSelectedColor(primaryCandidate.hex);
          setColorRamp(generateColorRamp(primaryCandidate.hex));
        } else if (colors.length > 0) {
          setSelectedColor(colors[0].hex);
          setColorRamp(generateColorRamp(colors[0].hex));
        }
        setIsExtracting(false);
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      console.error("Color extraction error:", err);
      setExtractError(
        err instanceof Error ? err.message : "색상 추출 중 오류가 발생했습니다",
      );
      setIsExtracting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 5,
  });

  const handleColorSelect = useCallback((hex: string) => {
    setSelectedColor(hex);
    setColorRamp(generateColorRamp(hex));
  }, []);

  const handleDemoPreset = useCallback((hex: string) => {
    setIsDemoMode(true);
    setSelectedColor(hex);
    setColorRamp(generateColorRamp(hex));
    setExtractedColors(
      DEMO_PRESETS.map((p) => ({
        hex: p.hex,
        rgb: { r: 0, g: 0, b: 0 },
        hct: { h: 0, c: 0, t: 0 },
        percentage: 20,
      })),
    );
  }, []);

  const resetAll = useCallback(() => {
    setImages([]);
    setExtractedColors([]);
    setSelectedColor(null);
    setColorRamp(null);
    setIsDemoMode(false);
    setPreviewDarkMode(false);
    setExtractError(null);
  }, []);

  const getExportData = useCallback((): ExportData | null => {
    if (!selectedColor || !colorRamp) return null;
    return {
      primaryColor: selectedColor,
      colorRamp,
      extractedColors,
      projectName: "Spaghetti Design System",
    };
  }, [selectedColor, colorRamp, extractedColors]);

  const handleExportThemeCSS = useCallback(() => {
    if (!themePalette) return;
    const css = exportThemeAsCSS(themePalette);
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "theme-variables.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [themePalette]);

  const handleExportZip = useCallback(async () => {
    if (!selectedColor || !colorRamp) return;
    setIsExporting(true);
    try {
      const tokens: TokenContext = {
        colors: {
          primary: selectedColor,
          primaryScale: colorScaleToRecord(colorRamp),
        },
        typography: {
          fontFamily:
            "Pretendard, -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
          },
        },
        spacing: {
          "0": "0",
          "1": "0.25rem",
          "2": "0.5rem",
          "3": "0.75rem",
          "4": "1rem",
          "6": "1.5rem",
          "8": "2rem",
        },
        radius: {
          none: "0",
          sm: "0.25rem",
          md: "0.5rem",
          lg: "1rem",
          full: "9999px",
        },
      };

      const blob = await generateDesignSystemZip({
        projectName: "Spaghetti Design System",
        tokens,
        components: ["Button", "Input", "Card"],
        framework: "react",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "spaghetti-design-system.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP Export error:", err);
    } finally {
      setIsExporting(false);
    }
  }, [selectedColor, colorRamp]);

  const canExport = selectedColor && colorRamp;
  const currentTheme = previewDarkMode
    ? themePalette?.dark
    : themePalette?.light;
  const currentScale = previewDarkMode
    ? themePalette?.darkColorScale
    : themePalette?.colorScale;

  return (
    <div className="min-h-screen bg-[#0A0A0A]" style={dynamicStyles}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="font-bold text-lg text-white tracking-tight"
          >
            SPAGHETTI
          </Link>

          <div className="flex items-center gap-3">
            {selectedColor && (
              <button
                onClick={resetAll}
                className="text-sm text-white/50 hover:text-white px-3 py-2 transition-colors"
              >
                초기화
              </button>
            )}
            <button
              onClick={handleExportZip}
              disabled={!canExport || isExporting}
              className="bg-white text-black text-sm px-5 py-2 rounded-full font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
            >
              {isExporting ? "생성 중..." : "Export ZIP"}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-14 min-h-screen">
        {/* Initial State */}
        {!selectedColor && !isExtracting && !extractError && (
          <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-6">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  이미지에서 컬러 추출
                </h1>
                <p className="text-white/50">
                  브랜드 이미지를 업로드하거나 프리셋으로 시작하세요
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 group ${
                  isDragActive
                    ? "border-white bg-white/10 scale-[1.02]"
                    : "border-white/20 hover:border-white/40 hover:bg-white/5"
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-6">
                  <div
                    className={`mx-auto w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center transition-transform duration-300 ${isDragActive ? "scale-110" : "group-hover:scale-105"}`}
                  >
                    <svg
                      className="w-10 h-10 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white mb-2">
                      {isDragActive ? "여기에 놓으세요" : "클릭하거나 드래그"}
                    </p>
                    <p className="text-sm text-white/40">PNG, JPG, WEBP</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/30">또는</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {DEMO_PRESETS.map((preset) => (
                  <button
                    key={preset.hex}
                    onClick={() => handleDemoPreset(preset.hex)}
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <div
                      className="w-6 h-6 rounded-lg shadow-lg transition-transform group-hover:scale-110"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Extracting State */}
        {isExtracting && (
          <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-6">
            <div className="text-center max-w-md">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${extractProgress * 2.83} 283`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {Math.round(extractProgress)}%
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                컬러 분석 중
              </h2>
              <p className="text-white/50">
                HCT 알고리즘으로 이미지를 분석하고 있습니다
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {extractError && !isExtracting && !selectedColor && (
          <div className="flex items-center justify-center min-h-[calc(100vh-56px)] px-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">오류 발생</h2>
              <p className="text-white/50 mb-6">{extractError}</p>
              <button
                onClick={() => {
                  setExtractError(null);
                  setImages([]);
                }}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}

        {/* Editor State */}
        {selectedColor && colorRamp && !isExtracting && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-56px)]">
            {/* Left Panel */}
            <div className="lg:w-96 bg-[#111] border-r border-white/5 flex flex-col">
              {/* Sidebar Tabs */}
              <div className="flex border-b border-white/5">
                {[
                  { key: "colors" as const, label: "컬러" },
                  { key: "accessibility" as const, label: "접근성" },
                  { key: "darkmode" as const, label: "다크모드" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSidebarTab(tab.key)}
                    className={`flex-1 py-3 text-sm font-medium transition-all ${
                      sidebarTab === tab.key
                        ? "text-white border-b-2 border-white"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-auto p-6">
                {/* Colors Tab */}
                {sidebarTab === "colors" && (
                  <div className="space-y-8">
                    <div>
                      <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                        Primary
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-16 h-16 rounded-2xl shadow-2xl"
                          style={{ backgroundColor: selectedColor }}
                        />
                        <div>
                          <div className="text-white font-mono text-sm">
                            {selectedColor.toUpperCase()}
                          </div>
                          <div className="text-white/40 text-xs mt-1">
                            {isDemoMode ? "데모" : "추출됨"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {extractedColors.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                          팔레트
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {extractedColors.map((color) => (
                            <button
                              key={color.hex}
                              onClick={() => handleColorSelect(color.hex)}
                              className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                                selectedColor === color.hex
                                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#111] scale-110"
                                  : "hover:scale-105"
                              }`}
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                        컬러 램프
                      </div>
                      <div className="space-y-1">
                        {Object.entries(colorRamp).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-3 group"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex-shrink-0 transition-transform group-hover:scale-110"
                              style={{ backgroundColor: value }}
                            />
                            <div className="flex-1 flex justify-between items-center">
                              <span className="text-xs text-white/60">
                                {key}
                              </span>
                              <span className="text-xs text-white/30 font-mono">
                                {value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Accessibility Tab */}
                {sidebarTab === "accessibility" && accessibilityData && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                        WCAG 대비비 검사
                      </div>
                      <div className="space-y-3">
                        {accessibilityData.map((check) => (
                          <div
                            key={check.name}
                            className="bg-white/5 rounded-xl p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-white/70">
                                {check.name}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ${
                                  check.result.level === "AAA"
                                    ? "bg-green-500/20 text-green-400"
                                    : check.result.level === "AA"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : check.result.level === "AA-Large"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {check.result.level}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded"
                                  style={{ backgroundColor: check.fg }}
                                />
                                <span className="text-white/30">→</span>
                                <div
                                  className="w-6 h-6 rounded border border-white/20"
                                  style={{ backgroundColor: check.bg }}
                                />
                              </div>
                              <span className="text-sm text-white/50 font-mono">
                                {check.result.ratioText}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                        기준
                      </div>
                      <div className="space-y-2 text-xs text-white/50">
                        <div className="flex justify-between">
                          <span>AAA (최고)</span>
                          <span className="text-green-400">7:1 이상</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AA (권장)</span>
                          <span className="text-blue-400">4.5:1 이상</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AA Large</span>
                          <span className="text-yellow-400">3:1 이상</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dark Mode Tab */}
                {sidebarTab === "darkmode" && themePalette && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">
                        미리보기 모드
                      </span>
                      <button
                        onClick={() => setPreviewDarkMode(!previewDarkMode)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${previewDarkMode ? "bg-white" : "bg-white/20"}`}
                      >
                        <div
                          className={`absolute top-1 w-5 h-5 rounded-full transition-all ${previewDarkMode ? "left-8 bg-[#0A0A0A]" : "left-1 bg-white"}`}
                        />
                      </button>
                    </div>

                    <div>
                      <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
                        {previewDarkMode ? "다크 테마" : "라이트 테마"}
                      </div>
                      <div className="space-y-2">
                        {currentTheme &&
                          Object.entries(currentTheme)
                            .slice(0, 8)
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center gap-3"
                              >
                                <div
                                  className="w-6 h-6 rounded border border-white/10"
                                  style={{ backgroundColor: value }}
                                />
                                <span className="text-xs text-white/50 flex-1">
                                  {key}
                                </span>
                                <span className="text-xs text-white/30 font-mono">
                                  {value}
                                </span>
                              </div>
                            ))}
                      </div>
                    </div>

                    <button
                      onClick={handleExportThemeCSS}
                      className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors"
                    >
                      테마 CSS 다운로드
                    </button>
                  </div>
                )}
              </div>

              {/* Export Buttons */}
              <div className="p-4 border-t border-white/5 space-y-2">
                <button
                  onClick={() => {
                    const d = getExportData();
                    if (d) downloadCssVariables(d);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-mono">
                    CSS
                  </span>
                  CSS Variables
                </button>
                <button
                  onClick={() => {
                    const d = getExportData();
                    if (d) downloadTailwindConfig(d);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#38BDF8]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.09 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C15.61 7.15 14.51 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.3.74 1.91 1.35C8.39 16.85 9.49 18 12 18c2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.3-.74-1.91-1.35C10.61 13.15 9.51 12 7 12z" />
                    </svg>
                  </span>
                  Tailwind
                </button>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div
              className="flex-1 p-6 md:p-10 overflow-auto"
              style={{
                backgroundColor: previewDarkMode ? "#0A0A0A" : "#F5F5F5",
              }}
            >
              {/* Uploaded Images */}
              {images.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {images.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white/10"
                      >
                        <Image
                          src={img.preview}
                          alt="Uploaded"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Tabs */}
              <div className="flex gap-2 mb-8">
                {[
                  { key: "buttons" as const, label: "버튼" },
                  { key: "forms" as const, label: "입력폼" },
                  { key: "cards" as const, label: "카드" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPreviewTab(tab.key)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      previewTab === tab.key
                        ? previewDarkMode
                          ? "bg-white text-black"
                          : "bg-[#1A1A1A] text-white"
                        : previewDarkMode
                          ? "bg-white/10 text-white/60 hover:bg-white/20"
                          : "bg-black/5 text-black/60 hover:bg-black/10"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Preview Content */}
              <div
                className={`rounded-3xl p-8 md:p-12 ${previewDarkMode ? "bg-[#1A1A1A]" : "bg-white"}`}
              >
                {previewTab === "buttons" && currentScale && (
                  <div className="space-y-10">
                    <div>
                      <div
                        className={`text-xs font-medium uppercase tracking-wider mb-4 ${previewDarkMode ? "text-white/40" : "text-[#999]"}`}
                      >
                        Solid
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {(["500", "600", "700"] as const).map((shade) => (
                          <button
                            key={shade}
                            className="px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all hover:scale-105"
                            style={{ backgroundColor: currentScale[shade] }}
                          >
                            Button {shade}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-xs font-medium uppercase tracking-wider mb-4 ${previewDarkMode ? "text-white/40" : "text-[#999]"}`}
                      >
                        Outline
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all hover:scale-105"
                          style={{
                            borderColor: currentScale["500"],
                            color: currentScale["500"],
                          }}
                        >
                          Outlined
                        </button>
                        <button
                          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                          style={{
                            backgroundColor: `${currentScale["500"]}20`,
                            color: currentScale["500"],
                          }}
                        >
                          Ghost
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {previewTab === "forms" && currentScale && (
                  <div className="max-w-md space-y-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${previewDarkMode ? "text-white" : "text-[#333]"}`}
                      >
                        이메일
                      </label>
                      <input
                        type="email"
                        placeholder="example@email.com"
                        className={`w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none transition-all ${
                          previewDarkMode
                            ? "bg-white/5 text-white border-white/10 placeholder:text-white/30"
                            : "bg-white text-black placeholder:text-black/30"
                        }`}
                        style={{ borderColor: `${currentScale["500"]}40` }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded"
                        style={{ accentColor: currentScale["500"] }}
                        defaultChecked
                      />
                      <span
                        className={`text-sm ${previewDarkMode ? "text-white/70" : "text-[#666]"}`}
                      >
                        이용약관에 동의합니다
                      </span>
                    </div>
                    <button
                      className="w-full py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: currentScale["500"] }}
                    >
                      제출하기
                    </button>
                  </div>
                )}

                {previewTab === "cards" && currentScale && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div
                      className={`rounded-2xl overflow-hidden hover:shadow-xl transition-shadow ${previewDarkMode ? "bg-white/5 border border-white/10" : "border border-[#E5E5E5]"}`}
                    >
                      <div
                        className="h-32"
                        style={{ backgroundColor: `${currentScale["500"]}20` }}
                      />
                      <div className="p-6">
                        <h3
                          className={`font-bold text-lg mb-2 ${previewDarkMode ? "text-white" : "text-[#1A1A1A]"}`}
                        >
                          카드 타이틀
                        </h3>
                        <p
                          className={`text-sm mb-4 ${previewDarkMode ? "text-white/60" : "text-[#666]"}`}
                        >
                          카드 설명 텍스트입니다.
                        </p>
                        <button
                          className="w-full py-3 rounded-xl text-white font-medium"
                          style={{ backgroundColor: currentScale["500"] }}
                        >
                          Action
                        </button>
                      </div>
                    </div>
                    <div
                      className="rounded-2xl p-6 text-white"
                      style={{ backgroundColor: currentScale["500"] }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-white/20" />
                        <div>
                          <div className="font-bold">Featured</div>
                          <div className="text-sm text-white/70">
                            Primary 배경
                          </div>
                        </div>
                      </div>
                      <button
                        className="w-full py-3 rounded-xl bg-white font-medium"
                        style={{ color: currentScale["500"] }}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
