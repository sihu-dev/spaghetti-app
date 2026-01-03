import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spaghetti AI - Design System Generator",
  description:
    "이미지 한 장으로 디자인 시스템을 만드세요. HCT 알고리즘 기반 컬러 추출 및 토큰 자동 생성.",
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
