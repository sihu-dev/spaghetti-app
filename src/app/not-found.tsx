import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-white/10 mb-4">404</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-white/50 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <Link
            href="/editor"
            className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
          >
            에디터 열기
          </Link>
        </div>
      </div>
    </div>
  );
}
