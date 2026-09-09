"use client";

import Image from "next/image";
import { useState } from "react";

interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  badge?: string;
  category: "social" | "project" | "contact";
  icon: "github" | "blog" | "project" | "mail" | "share" | "sparkles";
  highlight?: boolean;
}

const LINKS: LinkItem[] = [
  {
    id: "github",
    title: "GitHub",
    description: "@hohun1202 · 오픈소스 코드 및 일일 커밋 둘러보기",
    url: "https://github.com/hohun1202",
    badge: "Public Repos",
    category: "social",
    icon: "github",
    highlight: true,
  },
  {
    id: "blog",
    title: "기술 블로그",
    description: "새로운 기술 탐구, 트러블슈팅 및 배움의 여정 기록",
    url: "https://velog.io/@hohun1202",
    badge: "Tech Blog",
    category: "social",
    icon: "blog",
  },
  {
    id: "project-mylink",
    title: "mylink (현재 페이지)",
    description: "Next.js 16 & Tailwind v4 기반 개인 프로필 허브",
    url: "https://github.com/hohun1202/mylink",
    badge: "v0.1.0",
    category: "project",
    icon: "project",
  },
  {
    id: "email",
    title: "이메일 문의 & 커피챗",
    description: "hohun1202@gmail.com · 프로젝트 협업 및 네트워킹",
    url: "mailto:hohun1202@gmail.com",
    badge: "Always Open",
    category: "contact",
    icon: "mail",
  },
];

const TECH_STACK = [
  { name: "React 19", color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30" },
  { name: "Next.js 16", color: "from-zinc-500/20 to-zinc-400/20 text-zinc-200 border-zinc-400/30" },
  { name: "TypeScript", color: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30" },
  { name: "Tailwind CSS v4", color: "from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/30" },
  { name: "Node.js", color: "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30" },
  { name: "Git & GitHub", color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30" },
];

export default function Home() {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "social" | "project">("all");

  const showToast = (message: string) => {
    setCopiedType(message);
    setTimeout(() => {
      setCopiedType(null);
    }, 2400);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("hohun1202@gmail.com");
      showToast("이메일 주소(hohun1202@gmail.com)가 복사되었습니다! ✉️");
    } catch {
      showToast("이메일 복사에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "https://github.com/hohun1202";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "장호현 | 프로필 & 링크트리",
          text: "웹 개발자 장호현의 프로필 허브입니다.",
          url,
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("페이지 링크가 클립보드에 복사되었습니다! 🔗");
    } catch {
      showToast("링크 복사에 실패했습니다.");
    }
  };

  const filteredLinks = LINKS.filter((link) => {
    if (activeFilter === "all") return true;
    return link.category === activeFilter;
  });

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#080711] px-4 py-12 text-zinc-100 sm:py-20">
      {/* Background Dot Grid */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-70" />

      {/* Atmospheric Ambient Glows */}
      <div className="animate-float-slow pointer-events-none absolute -top-24 left-1/2 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[130px]" />
      <div className="animate-float-reverse pointer-events-none absolute top-1/3 left-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/15 blur-[120px]" />
      <div className="animate-float-slow pointer-events-none absolute bottom-10 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-600/15 blur-[140px]" />

      {/* Toast Notification */}
      {copiedType && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-emerald-500/30 bg-zinc-900/90 px-5 py-3 text-sm font-medium text-emerald-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <svg className="h-4 w-4 shrink-0 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <span>{copiedType}</span>
        </aside>
      )}

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-xl">
        {/* Profile Card Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-8">
          {/* Subtle Card Highlight Accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>협업 & 커피챗 환영</span>
          </div>

          {/* Avatar with Layered Rings */}
          <div className="relative mx-auto mb-5 h-28 w-28">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-sm" />
            <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/20 bg-[#121026] p-1.5 shadow-2xl">
              <Image
                src="/avatar.svg"
                alt="장호현 프로필"
                width={112}
                height={112}
                className="h-full w-full rounded-full object-cover transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            장호현
            <span className="ml-2 text-base font-normal text-zinc-400 sm:text-lg">
              (Hohyun Jang)
            </span>
          </h1>

          <p className="mt-2 text-sm font-medium text-indigo-300">
            Frontend & Web Developer
          </p>

          {/* Bio */}
          <p className="mx-auto mt-3.5 max-w-md text-sm leading-relaxed text-zinc-300">
            사용자 중심의 가치와 직관적인 인터페이스, 깨끗하고 지속 가능한 코드를 지향합니다.
            문제를 정의하고 기술을 통해 해결하는 과정을 즐깁니다.
          </p>

          {/* Location & Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1">
              📍 Seoul, South Korea
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1">
              🚀 성장 지향형 개발
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] sm:text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>이메일 복사</span>
            </button>

            <a
              href="https://github.com/hohun1202"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-all hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-[0.98] sm:text-sm"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub</span>
            </a>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-semibold text-zinc-300 transition-all hover:scale-[1.02] hover:bg-white/10 hover:text-white active:scale-[0.98] sm:text-sm"
              title="프로필 공유하기"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
        </section>

        {/* Section 1: Links with Filter */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
              주요 링크 & 연결
            </h2>

            {/* Category Filter Pills */}
            <div className="flex gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeFilter === "all"
                    ? "bg-indigo-600/30 text-indigo-300 font-medium border border-indigo-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                전체
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("social")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeFilter === "social"
                    ? "bg-indigo-600/30 text-indigo-300 font-medium border border-indigo-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                소셜
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("project")}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  activeFilter === "project"
                    ? "bg-indigo-600/30 text-indigo-300 font-medium border border-indigo-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                프로젝트
              </button>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            {filteredLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target={item.url.startsWith("http") ? "_blank" : undefined}
                rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)] ${
                  item.highlight
                    ? "border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/40 hover:border-indigo-500/60"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                } backdrop-blur-xl`}
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      item.highlight
                        ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300 group-hover:scale-105 group-hover:bg-indigo-600/30"
                        : "border-white/10 bg-white/5 text-zinc-300 group-hover:scale-105 group-hover:bg-white/10 group-hover:text-white"
                    }`}
                  >
                    {item.icon === "github" && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        />
                      </svg>
                    )}
                    {item.icon === "blog" && (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    )}
                    {item.icon === "project" && (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    )}
                    {item.icon === "mail" && (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right: Arrow */}
                <div className="shrink-0 text-zinc-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section 2: Featured Project Bento Showcase */}
        <section className="mt-8">
          <div className="mb-4 px-1">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
              대표 프로젝트 (Featured)
            </h2>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-white/[0.02] to-purple-950/20 p-6 backdrop-blur-2xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
                  ⚡ Open Source
                </span>
                <h3 className="mt-3 text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                  mylink — 개발자 프로필 & 링크 허브
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                  Next.js 16과 Tailwind CSS v4를 활용하여 구축된 초경량 개인 프로필 및 소셜 링크트리 웹 애플리케이션입니다. 
                  모던한 글래스모피즘 비주얼과 매끄러운 사용자 경험을 제공합니다.
                </p>
              </div>
            </div>

            {/* Tech Tags in Project */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                Next.js 16 App Router
              </span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                React 19
              </span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                Tailwind CSS v4
              </span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                TypeScript
              </span>
            </div>

            {/* Project Link Button */}
            <div className="mt-5 flex items-center justify-end">
              <a
                href="https://github.com/hohun1202/mylink"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:border-indigo-500"
              >
                <span>GitHub 저장소 보기</span>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: Tech Stack */}
        <section className="mt-8">
          <div className="mb-4 px-1">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
              기술 스택 (Tech Stack)
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className={`flex items-center gap-2.5 rounded-2xl border bg-gradient-to-br px-3.5 py-3 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${tech.color}`}
              >
                <div className="h-2 w-2 rounded-full bg-current opacity-80" />
                <span className="text-xs font-medium tracking-tight">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-14 pb-4 text-center">
          <div className="flex items-center justify-center gap-4 text-zinc-500">
            <a
              href="https://github.com/hohun1202"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
              title="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="hover:text-zinc-300 transition-colors"
              title="이메일 복사"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="hover:text-zinc-300 transition-colors"
              title="공유하기"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            © {new Date().getFullYear()} 장호현 (Hohyun Jang). All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
