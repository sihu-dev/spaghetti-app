import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CATALOG.AI - AI 제품 카탈로그 자동 생성",
  description:
    "제품 사진만으로 전문 카탈로그를 5분 만에. AI가 스펙 추출, 브랜드 컬러 분석, 다국어 번역까지 자동으로 처리합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
