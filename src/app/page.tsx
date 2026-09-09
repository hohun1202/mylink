export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Profile Avatar */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-xl font-bold text-zinc-800 shadow-inner dark:bg-zinc-800 dark:text-zinc-100">
          호현
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          장호현
        </h1>

        {/* Bio */}
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          안녕하세요! 바이브 코딩을 배우고 있는 대학생입니다.
        </p>
      </div>
    </main>
  );
}
