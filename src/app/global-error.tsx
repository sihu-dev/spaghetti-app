"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
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
          <h2 className="text-xl font-bold text-white mb-2">
            치명적인 오류가 발생했습니다
          </h2>
          <p className="text-white/50 mb-6">
            {error.message || "애플리케이션에 심각한 오류가 발생했습니다."}
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
