export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
          <div className="h-9 w-24 bg-white/10 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Content Skeleton */}
      <main className="pt-14 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl px-6">
          <div className="text-center mb-12">
            <div className="h-10 w-3/4 mx-auto bg-white/10 rounded animate-pulse mb-4" />
            <div className="h-5 w-1/2 mx-auto bg-white/5 rounded animate-pulse" />
          </div>

          {/* Upload Area Skeleton */}
          <div className="border-2 border-dashed border-white/10 rounded-3xl p-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/10 animate-pulse" />
            <div className="h-6 w-40 mx-auto bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-4 w-24 mx-auto bg-white/5 rounded animate-pulse" />
          </div>

          {/* Presets Skeleton */}
          <div className="flex gap-4 my-10 justify-center">
            <div className="flex-1 h-px bg-white/10" />
            <div className="h-4 w-8 bg-white/10 rounded animate-pulse" />
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-28 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
