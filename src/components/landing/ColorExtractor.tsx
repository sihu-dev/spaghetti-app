"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  extractColorsFromImage,
  selectPrimaryColor,
  type ExtractedColor,
} from "@/lib/color/extraction";
import { generateColorRamp, type ColorScale } from "@/lib/color/ramp";
import {
  downloadCssVariables,
  downloadTailwindConfig,
  downloadJsonTokens,
  type ExportData,
} from "@/lib/export";
import { DEMO_PRESETS } from "@/config/presets";

type ExportFormat = "css" | "tailwind" | "json";

export function ColorExtractor() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [colorRamp, setColorRamp] = useState<ColorScale | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setIsExtracting(true);
    setExtractProgress(0);

    const progressInterval = setInterval(() => {
      setExtractProgress((prev) =>
        prev >= 90 ? prev : prev + Math.random() * 15,
      );
    }, 200);

    try {
      const colors = await extractColorsFromImage(preview, { colorCount: 6 });
      clearInterval(progressInterval);
      setExtractProgress(100);

      setTimeout(() => {
        setExtractedColors(colors);
        const primary = selectPrimaryColor(colors);
        if (primary) {
          setSelectedColor(primary.hex);
          setColorRamp(generateColorRamp(primary.hex));
        }
        setIsExtracting(false);
      }, 300);
    } catch {
      clearInterval(progressInterval);
      setIsExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
  });

  const handlePreset = useCallback((hex: string) => {
    setImagePreview(null);
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

  const handleColorSelect = useCallback((hex: string) => {
    setSelectedColor(hex);
    setColorRamp(generateColorRamp(hex));
  }, []);

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (!selectedColor || !colorRamp) return;
      const data: ExportData = {
        primaryColor: selectedColor,
        colorRamp,
        extractedColors,
        projectName: "Spaghetti Design System",
      };
      switch (format) {
        case "css":
          downloadCssVariables(data);
          break;
        case "tailwind":
          downloadTailwindConfig(data);
          break;
        case "json":
          downloadJsonTokens(data);
          break;
      }
    },
    [selectedColor, colorRamp, extractedColors],
  );

  const reset = useCallback(() => {
    setImagePreview(null);
    setExtractedColors([]);
    setSelectedColor(null);
    setColorRamp(null);
  }, []);

  const hasResult = selectedColor && colorRamp;

  // Dynamic CSS Variables for preview
  const previewStyles = useMemo(() => {
    if (!colorRamp) return {};
    return {
      "--preview-50": colorRamp["50"],
      "--preview-100": colorRamp["100"],
      "--preview-500": colorRamp["500"],
      "--preview-600": colorRamp["600"],
      "--preview-900": colorRamp["900"],
    } as React.CSSProperties;
  }, [colorRamp]);

  return (
    <div className="w-full" style={previewStyles}>
      {/* Upload / Preset Section */}
      {!hasResult && !isExtracting && (
        <div className="space-y-8">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-[#5C6356] bg-[#5C6356]/5"
                : "border-[#E0E0E0] hover:border-[#999]"
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-[#999]"
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
            <p className="text-[#1A1A1A] font-medium mb-1">
              {isDragActive ? "여기에 놓으세요" : "이미지를 드래그하거나 클릭"}
            </p>
            <p className="text-sm text-[#999]">PNG, JPG, WEBP (최대 10MB)</p>
          </div>

          {/* Presets */}
          <div className="text-center">
            <p className="text-sm text-[#999] mb-4">또는 프리셋으로 시작</p>
            <div className="flex flex-wrap justify-center gap-3">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  onClick={() => handlePreset(preset.hex)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#E5E5E5] hover:border-[#999] transition-all group"
                >
                  <div
                    className="w-5 h-5 rounded-full shadow-sm transition-transform group-hover:scale-110"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span className="text-sm text-[#666]">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extracting State */}
      {isExtracting && (
        <div className="text-center py-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#E5E5E5"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#5C6356"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${extractProgress * 2.83} 283`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-[#1A1A1A]">
                {Math.round(extractProgress)}%
              </span>
            </div>
          </div>
          <p className="text-[#666]">HCT 알고리즘으로 색상 분석 중...</p>
        </div>
      )}

      {/* Result Section */}
      {hasResult && !isExtracting && (
        <div className="space-y-6">
          {/* Header with Reset */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="w-12 h-12 rounded-lg relative overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Uploaded"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <div className="text-xs text-[#999] uppercase tracking-wider">
                  Primary
                </div>
                <div className="font-mono text-[#1A1A1A]">
                  {selectedColor?.toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-sm text-[#999] hover:text-[#1A1A1A] transition-colors"
            >
              다시 시작
            </button>
          </div>

          {/* Color Palette */}
          {extractedColors.length > 0 && (
            <div className="flex gap-2">
              {extractedColors.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => handleColorSelect(color.hex)}
                  className={`flex-1 aspect-square rounded-xl transition-all ${
                    selectedColor === color.hex
                      ? "ring-2 ring-[#1A1A1A] ring-offset-2 scale-105"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
              ))}
            </div>
          )}

          {/* Color Scale */}
          <div className="bg-[#FAFAFA] rounded-2xl p-4">
            <div className="text-xs text-[#999] uppercase tracking-wider mb-3">
              Color Scale
            </div>
            <div className="flex gap-1">
              {Object.entries(colorRamp).map(([key, value]) => (
                <div
                  key={key}
                  className="flex-1 aspect-[1/2] rounded-lg first:rounded-l-xl last:rounded-r-xl"
                  style={{ backgroundColor: value }}
                  title={`${key}: ${value}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[#999]">
              <span>50</span>
              <span>500</span>
              <span>950</span>
            </div>
          </div>

          {/* Component Preview */}
          <div className="bg-[#FAFAFA] rounded-2xl p-6">
            <div className="text-xs text-[#999] uppercase tracking-wider mb-4">
              Component Preview
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: colorRamp["600"] }}
              >
                Primary Button
              </button>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-medium border-2"
                style={{
                  borderColor: colorRamp["500"],
                  color: colorRamp["600"],
                }}
              >
                Outline
              </button>
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: colorRamp["100"],
                  color: colorRamp["700"],
                }}
              >
                Soft
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleExport("css")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333] transition-colors"
            >
              <span className="text-xs opacity-60">↓</span> CSS
            </button>
            <button
              onClick={() => handleExport("tailwind")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333] transition-colors"
            >
              <span className="text-xs opacity-60">↓</span> Tailwind
            </button>
            <button
              onClick={() => handleExport("json")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333] transition-colors"
            >
              <span className="text-xs opacity-60">↓</span> JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
