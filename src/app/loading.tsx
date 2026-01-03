export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
        <p className="text-white/50 text-sm">로딩 중...</p>
      </div>
    </div>
  );
}
