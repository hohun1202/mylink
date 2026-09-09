import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0a1e] px-4 py-12 text-white">
      {/* Background Aurora / Glow Effect */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[650px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />

      {/* Profile Card */}
      <div className="relative z-10 w-full max-w-[380px] rounded-[32px] border border-white/10 bg-[#181438]/70 p-8 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
        {/* Profile Avatar with Status Indicator */}
        <div className="relative mx-auto mb-5 w-24 h-24">
          <div className="h-full w-full overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-tr from-indigo-500/30 to-purple-400/30 p-1 shadow-inner">
            <Image
              src="/avatar.svg"
              alt="프로필 이미지"
              width={96}
              height={96}
              className="h-full w-full rounded-full object-cover"
              priority
            />
          </div>
          {/* Active Status Badge */}
          <span className="absolute bottom-1 right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-[#181438] bg-emerald-500" />
          </span>
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold tracking-tight text-white">
          장호현
        </h1>

        {/* Bio */}
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          안녕하세요! 사용자 경험과 깨끗한 코드를 지향하는 웹 개발자입니다. 문제를 정의하고 해결하는 과정을 즐깁니다.
        </p>

        {/* Tags / Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md hover:border-white/20 hover:bg-white/10 transition-colors">
            💻 웹 개발자
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md hover:border-white/20 hover:bg-white/10 transition-colors">
            ⚡ Next.js & React
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md hover:border-white/20 hover:bg-white/10 transition-colors">
            🚀 지속 가능한 성장
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex w-full items-center gap-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>연락하기</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-zinc-200 transition-all hover:scale-[1.02] hover:bg-white/15 hover:text-white active:scale-[0.98]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span>링크</span>
          </button>
        </div>
      </div>
    </main>
  );
}
