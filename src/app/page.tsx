"use client";

import Image from "next/image";
import { useState } from "react";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const NAV_PRIMARY = [
  { label: "GitHub", href: "https://github.com/hohun1202" },
  { label: "Blog", href: "https://velog.io/@hohun1202" },
  { label: "Projects", href: "https://github.com/hohun1202?tab=repositories" },
  { label: "Contact", href: "mailto:hohun1202@gmail.com" },
  { label: "About", href: "#about" },
] as const;

const LINKS = [
  {
    id: "github",
    icon: "GH",
    label: "GitHub",
    sub: "@hohun1202 · 오픈소스 코드 & 일일 커밋",
    href: "https://github.com/hohun1202",
    badge: "PUBLIC",
  },
  {
    id: "blog",
    icon: "VL",
    label: "기술 블로그",
    sub: "Velog · 트러블슈팅 & 배움의 여정",
    href: "https://velog.io/@hohun1202",
    badge: "ARTICLES",
  },
  {
    id: "mylink",
    icon: "ML",
    label: "mylink (이 사이트)",
    sub: "Next.js 16 · Tailwind v4 · Open Source",
    href: "https://github.com/hohun1202/mylink",
    badge: "V0.2",
  },
  {
    id: "email",
    icon: "✉",
    label: "이메일 문의 & 커피챗",
    sub: "hohun1202@gmail.com · 협업 & 문의",
    href: "mailto:hohun1202@gmail.com",
    badge: "OPEN",
  },
] as const;

const PROJECTS = [
  {
    id: "mylink",
    title: "mylink",
    url: "github.com/hohun1202/mylink",
    href: "https://github.com/hohun1202/mylink",
  },
  {
    id: "velog",
    title: "Tech Blog",
    url: "velog.io/@hohun1202",
    href: "https://velog.io/@hohun1202",
  },
  {
    id: "github",
    title: "GitHub Profile",
    url: "github.com/hohun1202",
    href: "https://github.com/hohun1202",
  },
  {
    id: "contact",
    title: "Contact Me",
    url: "hohun1202@gmail.com",
    href: "mailto:hohun1202@gmail.com",
  },
] as const;

const POLL_OPTIONS = [
  { id: "react", label: "React / Next.js" },
  { id: "ts", label: "TypeScript" },
  { id: "ux", label: "UX Engineering" },
  { id: "os", label: "Open Source" },
] as const;

/* ─── Sub-components ────────────────────────────────────────────────────── */

/** Panel header bar — uppercase chrome label with grid glyph */
function SectionLabelBar({ title }: { title: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1"
      style={{
        background: "#7a8aba",
        borderBottom: "1px solid #3d4f97",
        borderTop: "1px solid #a8b8d8",
      }}
    >
      <span style={{ color: "#21242e", fontSize: 9, fontWeight: 700, letterSpacing: "0.5px" }}>
        ≡
      </span>
      <span
        style={{
          color: "#21242e",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {title}
      </span>
    </div>
  );
}

/** Signal orange round arrow button */
function ArrowButton({ href, onClick }: { href?: string; onClick?: () => void }) {
  const cls =
    "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80";
  const style = { background: "#f68d1f", border: "1px solid #c86a00" };
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

/** news-row style link row */
function NewsRow({ icon, label, sub, href, badge }: {
  icon: string; label: string; sub: string; href: string; badge: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-2 px-2 py-[5px] transition-colors hover:bg-[#c0d5e6]"
      style={{ borderBottom: "1px solid #3d4f97" }}
    >
      {/* Icon monogram */}
      <span
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center text-[9px] font-bold"
        style={{
          background: "#21242e",
          color: "#ffffff",
          border: "1px solid #3d4f97",
          fontFamily: "Arial, Helvetica, sans-serif",
          letterSpacing: "0.5px",
        }}
      >
        {icon}
      </span>
      {/* Text */}
      <div className="min-w-0 flex-1">
        <div
          className="truncate font-bold group-hover:underline"
          style={{ color: "#3d4f97", fontSize: 12, fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          {label}
        </div>
        <div
          className="truncate"
          style={{ color: "#21242e", fontSize: 10, fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          {sub}
        </div>
      </div>
      {/* Badge + Arrow */}
      <div className="flex shrink-0 items-center gap-1">
        <span
          className="px-1.5 py-0.5 text-[9px] font-bold"
          style={{
            background: "#ecab37",
            color: "#21242e",
            fontFamily: "Arial, Helvetica, sans-serif",
            letterSpacing: "0.5px",
            border: "1px solid #c88000",
            borderRadius: 2,
          }}
        >
          {badge}
        </span>
        <ArrowButton href={href} />
      </div>
    </a>
  );
}

/** Featured tile — carbon-framed thumbnail */
function FeaturedTile({ title, url, href }: { title: string; url: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block transition-opacity hover:opacity-80"
      style={{
        border: "1px solid #3d4f97",
        borderRadius: 4,
        overflow: "hidden",
        background: "#dedede",
      }}
    >
      {/* Thumbnail placeholder area */}
      <div
        className="flex h-[60px] items-center justify-center"
        style={{ background: "#acace7", borderBottom: "1px solid #3d4f97" }}
      >
        <span
          style={{
            color: "#3d4f97",
            fontSize: 16,
            fontWeight: 900,
            fontFamily: "Arial, Helvetica, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </span>
      </div>
      {/* URL caption */}
      <div className="px-1.5 py-0.5">
        <span style={{ color: "#60619c", fontSize: 9, fontFamily: "Arial, Helvetica, sans-serif" }}>
          {url}
        </span>
      </div>
    </a>
  );
}

/** Carbon right-rail action button */
function RailButton({
  label,
  icon,
  href,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "command-slab halftone flex w-full items-center gap-2 px-3 py-[7px] text-left transition-opacity hover:opacity-80";
  const inner = (
    <>
      <span className="text-sm" style={{ color: "#ecab37" }}>
        {icon}
      </span>
      <span
        style={{
          color: "#ffffff",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        {label}
      </span>
    </>
  );
  if (href)
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={cls}
        style={{ border: "none", borderBottom: "1px solid #3d4f97" }}
      >
        {inner}
      </a>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      className={cls}
      style={{ border: "none", borderBottom: "1px solid #3d4f97" }}
    >
      {inner}
    </button>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function Home() {
  const [pollVote, setPollVote] = useState<string | null>(null);
  const [pollSubmitted, setPollSubmitted] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("hohun1202@gmail.com");
      showToast("hohun1202@gmail.com 복사 완료 ✉");
    } catch {
      showToast("복사 실패");
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: "HOHYUN JANG", url }); return; } catch { /* fallback */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크 복사 완료 🔗");
    } catch { showToast("복사 실패"); }
  };

  const submitPoll = () => {
    if (pollVote) setPollSubmitted(true);
  };

  return (
    <main style={{ background: "#7a8aba", minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif" }}>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toastMsg && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4 py-2"
          style={{
            background: "#ecab37",
            border: "1px solid #21242e",
            borderRadius: 2,
            boxShadow: "3px 3px 0 #21242e",
            fontSize: 12,
            fontWeight: 700,
            color: "#21242e",
            whiteSpace: "nowrap",
          }}
        >
          {toastMsg}
        </aside>
      )}

      {/* ── Fixed-width chrome canvas ────────────────────────────────────── */}
      <div className="mx-auto" style={{ maxWidth: 830, minWidth: 320 }}>

        {/* ════════════════════════════════════════════════════════════════
            MASTHEAD ROW — mascot speech bubble + search
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="flex items-end justify-between gap-4 px-3 py-2"
          style={{ background: "#7a8aba", borderBottom: "1px solid #3d4f97" }}
        >
          {/* Speech bubble */}
          <div className="flex items-end gap-2">
            {/* Pixel mascot placeholder */}
            <div
              className="flex h-[48px] w-[38px] shrink-0 items-center justify-center text-2xl select-none"
              title="Mascot"
              style={{ marginBottom: -2 }}
            >
              🎮
            </div>
            {/* Bubble */}
            <div
              className="relative px-3 py-1.5"
              style={{
                background: "#ffffff",
                border: "1px solid #21242e",
                borderRadius: 10,
                fontSize: 10,
                color: "#21242e",
                fontWeight: 400,
                maxWidth: 200,
              }}
            >
              <span style={{ fontWeight: 700 }}>Welcome to HOHYUN.DEV!</span>
              {" "}個人プロフィール & リンク集
              {/* Bubble tail */}
              <span
                style={{
                  position: "absolute",
                  bottom: 6,
                  left: -6,
                  width: 0,
                  height: 0,
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderRight: "6px solid #ffffff",
                  filter: "drop-shadow(-1px 0 0 #21242e)",
                }}
              />
            </div>
          </div>

          {/* Search module */}
          <div className="flex shrink-0 items-center gap-1" style={{ fontSize: 11 }}>
            <span style={{ color: "#21242e", fontWeight: 700, fontSize: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              FIND:
            </span>
            <input
              readOnly
              value="hohun1202@gmail.com"
              onClick={copyEmail}
              className="cursor-pointer px-2 py-1 focus:outline-none"
              style={{
                border: "1px solid #3d4f97",
                borderRadius: 2,
                fontSize: 10,
                color: "#21242e",
                background: "#ffffff",
                width: 160,
              }}
              title="클릭하여 이메일 복사"
            />
            <button
              type="button"
              onClick={copyEmail}
              className="px-2 py-1 font-bold transition-opacity hover:opacity-80"
              style={{
                background: "#ecab37",
                border: "1px solid #3d4f97",
                borderRadius: 2,
                fontSize: 10,
                fontWeight: 700,
                color: "#21242e",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Go
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            PRIMARY NAV BAR — carbon slab with halftone
        ════════════════════════════════════════════════════════════════ */}
        <nav
          className="command-slab halftone flex items-stretch"
          style={{ height: 28, borderBottom: "2px solid #3d4f97" }}
          aria-label="Primary navigation"
        >
          {/* Logo pill */}
          <a
            href="/"
            className="flex shrink-0 items-center px-3"
            style={{
              borderRight: "1px solid #3d4f97",
              background: "transparent",
            }}
          >
            <span
              style={{
                background: "#ffffff",
                color: "#e60012",
                fontWeight: 900,
                fontSize: 11,
                padding: "1px 8px",
                borderRadius: 9999,
                letterSpacing: 0.5,
                border: "1px solid #e60012",
                lineHeight: 1.6,
              }}
            >
              HJ
            </span>
          </a>

          {/* Nav words */}
          <div className="flex flex-1 items-stretch overflow-x-auto">
            {NAV_PRIMARY.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center px-3 transition-colors hover:bg-[#2e3445]"
                style={{
                  color: "#e48600",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  borderRight: "1px solid #3d4f97",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Utility chips */}
          <div className="flex shrink-0 items-center gap-1 px-2">
            <button
              type="button"
              onClick={copyEmail}
              className="flex items-center px-2 py-0.5 font-bold transition-opacity hover:opacity-80"
              style={{
                background: "#ecab37",
                border: "1px solid #c88000",
                borderRadius: 2,
                fontSize: 10,
                fontWeight: 700,
                color: "#21242e",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Email
            </button>
            <a
              href="https://github.com/hohun1202"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-2 py-0.5 font-bold transition-opacity hover:opacity-80"
              style={{
                background: "#ecab37",
                border: "1px solid #c88000",
                borderRadius: 2,
                fontSize: 10,
                fontWeight: 700,
                color: "#21242e",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              GitHub
            </a>
          </div>
        </nav>

        {/* ════════════════════════════════════════════════════════════════
            SECONDARY NAV STRIP — pale sky utility links
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="flex items-center gap-0 overflow-x-auto"
          style={{
            background: "#9fbee7",
            borderBottom: "1px solid #3d4f97",
            height: 22,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          {["Seoul, KR", "Available", "Coffee Chat", "Open Source", "React Dev", "TypeScript"].map(
            (item, i, arr) => (
              <span key={item} className="flex items-center">
                <span
                  style={{
                    color: "#21242e",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    padding: "0 8px",
                  }}
                >
                  {item}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: "#3d4f97", fontSize: 10 }}>|</span>
                )}
              </span>
            )
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            HERO PANEL — lavender field, outlined wordmark, avatar
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="relative flex items-center gap-6 overflow-hidden px-6 py-5"
          style={{
            background: "linear-gradient(135deg, #acace7 0%, #8ba1d4 100%)",
            borderBottom: "2px solid #3d4f97",
            minHeight: 140,
          }}
        >
          {/* Avatar — circular, beveled */}
          <div className="shrink-0">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: "3px solid #21242e",
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "3px 3px 0 #21242e",
              }}
            >
              <Image
                src="/avatar.svg"
                alt="장호현 아바타"
                width={100}
                height={100}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            {/* Online pill */}
            <div
              className="mt-1 flex items-center justify-center gap-1 px-2 py-0.5"
              style={{
                background: "#ffffff",
                border: "1px solid #3d4f97",
                borderRadius: 9999,
                fontSize: 9,
                fontWeight: 700,
                color: "#3d4f97",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2da44e", display: "inline-block" }} />
              ONLINE
            </div>
          </div>

          {/* Wordmark + tagline */}
          <div className="flex-1">
            {/* Hero wordmark */}
            <div className="hero-wordmark leading-none">HOHYUN</div>
            <div className="hero-wordmark leading-none">JANG</div>
            <div
              className="mt-2"
              style={{
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 700,
                textShadow: "1px 1px 0 #3d4f97",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              Frontend &amp; Web Developer
            </div>
            <div
              style={{
                color: "#21242e",
                fontSize: 12,
                fontFamily: "Arial, Helvetica, sans-serif",
                marginTop: 4,
              }}
            >
              사용자 경험과 깨끗한 코드를 지향하는 웹 개발자입니다.
            </div>
            {/* Signal orange CTA */}
            <div className="mt-3 flex items-center gap-2">
              <a
                href="https://github.com/hohun1202"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 font-bold transition-opacity hover:opacity-80"
                style={{
                  background: "#f68d1f",
                  border: "1px solid #c86a00",
                  borderRadius: 4,
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                GitHub 바로가기
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="px-3 py-1.5 font-bold transition-opacity hover:opacity-80"
                style={{
                  background: "#ecab37",
                  border: "1px solid #c88000",
                  borderRadius: 4,
                  color: "#21242e",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                이메일 복사
              </button>
            </div>
          </div>

          {/* Page-accent tint tag */}
          <div
            className="absolute right-3 top-3 px-2 py-0.5"
            style={{
              background: "#3d4f97",
              color: "#ffffff",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              borderRadius: 2,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            PROFILE
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            BODY — 2-column split (left 2/3, right 1/3) + left rail tabs
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex" style={{ background: "#7a8aba", borderBottom: "2px solid #3d4f97" }}>

          {/* Left rotated tab rail */}
          <div
            className="hidden shrink-0 flex-col items-center gap-0 py-1 sm:flex"
            style={{ width: 22, background: "#21242e", borderRight: "1px solid #3d4f97" }}
          >
            {["LINKS", "PROJECTS", "STACK", "INFO"].map((tab) => (
              <span
                key={tab}
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: "#9fbee7",
                  padding: "8px 4px",
                  borderTop: "1px solid #3d4f97",
                  textTransform: "uppercase",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  userSelect: "none",
                }}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* Content column (2/3) */}
          <div className="flex-1 min-w-0" style={{ borderRight: "1px solid #3d4f97" }}>

            {/* ── Official Links panel ── */}
            <div style={{ borderBottom: "1px solid #3d4f97" }}>
              <SectionLabelBar title="Official Links — Profiles & Contact" />
              <div style={{ background: "#dedede" }}>
                {LINKS.map((link) => (
                  <NewsRow key={link.id} {...link} />
                ))}
              </div>
            </div>

            {/* ── Featured Projects panel ── */}
            <div style={{ borderBottom: "1px solid #3d4f97" }}>
              <SectionLabelBar title="Featured Projects" />
              <div
                className="grid grid-cols-2 gap-2 p-2"
                style={{ background: "#dedede" }}
              >
                {PROJECTS.map((p) => (
                  <FeaturedTile key={p.id} title={p.title} url={p.url} href={p.href} />
                ))}
              </div>
            </div>

            {/* ── Player's Poll — Tech Stack Vote ── */}
            <div id="about">
              <SectionLabelBar title="Developer's Poll — Pick My Strongest Skill" />
              <div className="p-3" style={{ background: "#8ba1d4" }}>
                {pollSubmitted ? (
                  <div
                    className="py-3 text-center"
                    style={{
                      color: "#21242e",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                  >
                    Thanks for voting! ✓
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        color: "#21242e",
                        fontSize: 12,
                        marginBottom: 8,
                        fontFamily: "Arial, Helvetica, sans-serif",
                      }}
                    >
                      What is Hohyun&apos;s strongest area?
                    </p>
                    <div className="flex flex-col gap-1.5 mb-3">
                      {POLL_OPTIONS.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex cursor-pointer items-center gap-2"
                          style={{ fontSize: 12, color: "#21242e", fontFamily: "Arial, Helvetica, sans-serif" }}
                        >
                          <input
                            type="radio"
                            name="poll"
                            value={opt.id}
                            checked={pollVote === opt.id}
                            onChange={() => setPollVote(opt.id)}
                            style={{ accentColor: "#f68d1f", width: 12, height: 12 }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={submitPoll}
                      disabled={!pollVote}
                      className="px-4 py-1.5 font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
                      style={{
                        background: "#f68d1f",
                        border: "1px solid #c86a00",
                        borderRadius: 2,
                        color: "#ffffff",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        fontFamily: "Arial, Helvetica, sans-serif",
                        cursor: pollVote ? "pointer" : "not-allowed",
                      }}
                    >
                      Submit
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Right Action Rail (1/3) */}
          <div className="w-[200px] shrink-0 lg:w-[220px]" style={{ background: "#7a8aba" }}>

            {/* Action buttons */}
            <div style={{ borderBottom: "1px solid #3d4f97" }}>
              <div
                className="px-2 py-1"
                style={{
                  background: "#3d4f97",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#9fbee7",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                Quick Links
              </div>
              <RailButton label="GitHub" icon="⌂" href="https://github.com/hohun1202" />
              <RailButton label="Blog" icon="✎" href="https://velog.io/@hohun1202" />
              <RailButton label="Copy Email" icon="✉" onClick={copyEmail} />
              <RailButton label="Share Page" icon="⇧" onClick={handleShare} />
            </div>

            {/* Info Box — "What Is" */}
            <div style={{ borderBottom: "1px solid #3d4f97" }}>
              <div
                className="px-2 py-1"
                style={{
                  background: "#ecab37",
                  border: "none",
                  borderBottom: "1px solid #c88000",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#21242e",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                What Is — mylink
              </div>
              <div
                className="p-2"
                style={{ background: "#ffffff", fontSize: 11, color: "#21242e", fontFamily: "Arial, Helvetica, sans-serif", lineHeight: 1.5 }}
              >
                mylink는 Next.js 16 + Tailwind v4로 제작된 개인 프로필 & 링크 허브입니다.
                <div
                  className="mt-2"
                  style={{ borderTop: "1px dotted #60619c", paddingTop: 6, fontSize: 10, color: "#60619c" }}
                >
                  <a href="https://github.com/hohun1202/mylink" target="_blank" rel="noopener noreferrer"
                    style={{ color: "#3d4f97", fontWeight: 700, textDecoration: "none" }}>
                    View Source ›
                  </a>
                </div>
              </div>
            </div>

            {/* Promo card */}
            <div style={{ borderBottom: "1px solid #3d4f97" }}>
              <div
                className="p-3"
                style={{ background: "#acace7" }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: "#ffffff",
                    WebkitTextStroke: "1px #3d4f97",
                    textShadow: "2px 2px 0 #3d4f97",
                    textTransform: "uppercase",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    lineHeight: 1.1,
                    marginBottom: 6,
                  }}
                >
                  TECH<br />STACK
                </div>
                {["React 19", "Next.js 16", "TypeScript", "Tailwind v4"].map((t) => (
                  <div
                    key={t}
                    className="mb-1 px-1.5 py-0.5"
                    style={{
                      background: "#ffffff",
                      border: "1px solid #3d4f97",
                      borderRadius: 2,
                      fontSize: 10,
                      color: "#21242e",
                      fontWeight: 700,
                      fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* ESRB-style badge */}
            <div className="p-2" style={{ background: "#7a8aba" }}>
              <div
                className="flex items-center gap-1.5 px-2 py-1"
                style={{
                  background: "#ecab37",
                  border: "1px solid #c88000",
                  borderRadius: 2,
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#21242e",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  fontFamily: "Arial, Helvetica, sans-serif",
                }}
              >
                <span style={{ fontSize: 14 }}>🏅</span>
                <span>Developer<br />Certified</span>
              </div>
            </div>

          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            FOOTER BAR — carbon chamfered slab
        ════════════════════════════════════════════════════════════════ */}
        <footer
          className="command-slab halftone chamfered flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          style={{ borderTop: "2px solid #3d4f97" }}
        >
          <span
            style={{
              color: "#9fbee7",
              fontSize: 10,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            ©{new Date().getFullYear()} 장호현 (HOHYUN JANG) · All Rights Reserved
          </span>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/hohun1202"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#9fbee7",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                textDecoration: "none",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={copyEmail}
              style={{
                background: "none",
                border: "none",
                color: "#9fbee7",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: 0,
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              Contact
            </button>
            {/* ESRB privacy badge */}
            <span
              className="px-1.5 py-0.5"
              style={{
                background: "#ecab37",
                border: "1px solid #c88000",
                borderRadius: 2,
                fontSize: 8,
                fontWeight: 700,
                color: "#21242e",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: "Arial, Helvetica, sans-serif",
              }}
            >
              ESRB — Privacy Certified
            </span>
          </div>
        </footer>

      </div>
    </main>
  );
}
