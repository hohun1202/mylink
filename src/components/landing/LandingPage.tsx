"use client"; // 로그인 버튼(클릭)을 담으므로 클라이언트 컴포넌트

// 로그인하지 않은 사람에게 첫 화면(/)에서 보여주는 소개 페이지입니다. (PRD F1 · 와이어프레임 2.1 메인 랜딩)
// 디자인은 사이트 전체와 같은 "Nintendo 2001 금속판" (docs/design.md) 입니다.
// 위에서부터 4덩어리:
//   1. 히어로 — 큰 헤드라인 + [Google로 계속하기] + 오른쪽 휴대폰 미리보기 (LandingPreview)
//   2. 링크 하나로 이만큼 — 기능 카드 4장
//   3. 시작은 3단계 — 로그인 → 링크 추가 → 주소 공유
//   4. 마지막 권유 — 주황 받침판 위 "PRESS START" + 로그인 버튼
// 2~4 는 히어로와 같은 디자인 말투를 쓴다: 주황 각진 딱지, 흰 큰 제목 + 인디고 그림자 + 빨강 강조,
//   미리보기 속 링크 줄과 같은 금속판(검정 아이콘 칸 · 주황 동그라미), 기울어진 주황 받침판
// 반응형: 휴대폰에서는 모두 한 줄로 쌓이고(가운데 정렬), 넓은 화면(md: 768px~)에서는
//         히어로가 좌우 2칸, 기능 카드가 2~4칸, 3단계가 (lg 1024px~) 가로 3칸으로 펼쳐집니다.
//         (페이지 폭은 HomeView 에서 휴대폰 448px → 넓은 화면 896px 로 넓혀 줌)

import type { ReactNode } from "react";
import { ArrowDown, ArrowRight, AtSign, ChartColumn, Link2, LogIn, Plus, Share2, Sparkles, type LucideIcon } from "lucide-react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import LandingPreview from "@/components/landing/LandingPreview"; // 휴대폰 모양 미리보기
import LinkIcon from "@/components/link/LinkIcon"; // 진짜 링크 버튼과 같은 아이콘 칸

// 기능 카드 4장의 내용 (아이콘 · 띠 라벨 · 제목 · 설명)
const FEATURES: { icon: LucideIcon; label: string; title: string; body: ReactNode }[] = [
  {
    icon: Link2,
    label: "ALL IN ONE",
    title: "링크를 한 페이지에",
    body: "깃허브·블로그·유튜브… 흩어진 링크를 내 페이지 하나에 모아요.",
  },
  {
    icon: Sparkles,
    label: "AUTO ICON",
    title: "로고는 알아서",
    body: "주소만 넣으면 사이트에 맞는 로고 아이콘이 저절로 붙어요.",
  },
  {
    icon: AtSign,
    label: "MY ADDRESS",
    title: "나만의 주소",
    body: "mylink/내아이디 주소 하나만 프로필에 걸어 두면 끝.",
  },
  {
    icon: ChartColumn,
    label: "STATS",
    title: "클릭 수 통계",
    body: "어떤 링크가 몇 번 눌렸는지 그래프로 한눈에 볼 수 있어요.",
  },
];

// "로고는 알아서" 카드에 늘어놓을 아이콘 예시 (주소 → 아이콘 모양만 고르는 데 씀)
const ICON_SAMPLES = ["https://github.com", "https://youtube.com", "https://instagram.com", "https://x.com", "https://velog.io"];

// 3단계 사용법
const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: LogIn, title: "Google로 로그인", body: "가입 양식 없이 구글 계정으로 바로 시작해요." },
  { icon: Plus, title: "링크 추가", body: "[새로운 링크 추가하기]를 눌러 제목과 주소만 적어요." },
  { icon: Share2, title: "주소 공유", body: "내 페이지 주소를 SNS 프로필·이력서에 붙여요." },
];

export default function LandingPage() {
  return (
    <div className="flex w-full flex-col gap-14 py-4 md:gap-20 md:py-8">
      <Hero />
      <Features />
      <Steps />
      <FinalCta />
    </div>
  );
}

// ─── 1. 히어로 ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    // 휴대폰: 글 → 미리보기 순으로 세로 / md 이상: 왼쪽 글, 오른쪽 미리보기
    <section className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
      <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left">
        {/* 작은 주황 딱지: 45° 잘린 모서리(chamfered) + 대문자 라벨 */}
        <span className="chamfered nav-label bg-accent px-3 py-1 text-accent-foreground">★ One page · Every link</span>

        {/* 헤드라인: 흰 글자 + 인디고 각진 그림자. "One Link." 만 빨강으로 강조. 화면이 넓을수록 글자도 커진다 */}
        <h1 className="text-5xl leading-[1.05] font-black text-primary-foreground text-shadow-hard sm:text-6xl lg:text-7xl">
          Development
          <br />
          in <span className="text-primary">One Link.</span>
        </h1>

        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold text-foreground">Showcase your git, blog, and more.</p>
          <p className="text-sm text-foreground">개발자의 모든 링크를, 주소 하나로 보여 주세요.</p>
        </div>

        {/* 버튼 두 개: 휴대폰에서는 위아래로 꽉 차게, sm 이상에서는 옆으로 나란히 */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* 로그인에 실패하면(팝업 차단 등) 버튼 컴포넌트가 토스트로 알려 준다 */}
          <GoogleLoginButton size="lg" label="Google로 계속하기" className="h-12 w-full px-6 text-base shadow-hard sm:w-auto" />
          {/* 아래 "3단계" 덩어리로 부드럽게 내려가는 링크 */}
          <a
            href="#how"
            className="inline-flex h-12 items-center justify-center gap-1.5 rounded-sm px-4 text-base font-bold text-foreground underline-offset-4 hover:underline"
          >
            어떻게 쓰나요?
            <ArrowDown aria-hidden className="size-4 motion-safe:animate-bounce" />
          </a>
        </div>

        {/* 안내: 무엇이 어떻게 저장되는지 */}
        <p className="text-xs text-foreground">로그인하면 링크를 추가·수정·삭제할 수 있고, 링크는 내 계정에만 따로 저장돼요.</p>
      </div>

      <LandingPreview />
    </section>
  );
}

// ─── 2. 기능 카드 ───────────────────────────────────────────────────────────
// 히어로와 같은 말투로: 주황 딱지 + 흰 큰 제목(빨강 강조), 카드는 미리보기 속 링크 줄과 같은 금속판
function Features() {
  return (
    <section aria-labelledby="features-title" className="flex flex-col gap-6">
      <SectionTitle id="features-title" chip="★ What you get" accent="이만큼">
        링크 하나로
      </SectionTitle>

      {/* 휴대폰 1칸 → sm 2칸 → lg 4칸 */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, label, title, body }) => (
          <li
            key={label}
            // 미리보기 링크 줄과 같은 입체 금속판 + 각진 그림자. 마우스를 올리면 살짝 들리며 그림자가 길어진다
            className="group flex flex-col gap-3 rounded-sm border border-t-bevel border-l-bevel border-r-border border-b-2 border-b-border bg-card p-4 text-card-foreground shadow-hard transition-[transform,box-shadow,background-color] duration-150 hover:bg-muted motion-safe:hover:-translate-x-0.5 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[6px_6px_0_var(--carbon)]"
          >
            <div className="flex items-center justify-between">
              {/* 아이콘 칸: 링크 아이콘 칸과 같은 검정 네모 + 인디고 테두리 + 흰 아이콘 */}
              <span className="flex size-10 items-center justify-center border border-border bg-carbon text-carbon-foreground">
                <Icon aria-hidden className="size-5" />
              </span>
              {/* 히어로 딱지와 같은 주황 각진 라벨 */}
              <span className="chamfered nav-label bg-accent px-2 py-0.5 text-accent-foreground">{label}</span>
            </div>
            {/* 제목: 링크 줄 제목과 같은 인디고 굵은 글씨 */}
            <h3 className="text-base font-black text-muted-foreground group-hover:underline">{title}</h3>
            <p className="text-sm">{body}</p>
            {/* "로고는 알아서" 카드에만: 실제로 붙는 로고들을 늘어놓아 보여 준다 */}
            {label === "AUTO ICON" && (
              <div className="mt-auto flex flex-wrap gap-1.5">
                {ICON_SAMPLES.map((url) => (
                  <LinkIcon key={url} url={url} className="size-7" />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── 3. 3단계 사용법 ────────────────────────────────────────────────────────
function Steps() {
  return (
    // scroll-mt-20: 위에 붙어 있는 헤더에 제목이 가려지지 않게, 링크로 내려올 때 여유를 둔다
    <section id="how" aria-labelledby="how-title" className="flex scroll-mt-20 flex-col gap-6">
      <SectionTitle id="how-title" chip="★ How it works" accent="3단계">
        시작은
      </SectionTitle>

      {/* 휴대폰·태블릿: 세로로 쌓이고 사이에 ↓ / lg(1024px) 이상: 가로 3칸에 사이사이 → */}
      <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="contents">
            {/* 미리보기 링크 줄과 같은 금속판: 아이콘 칸 자리에 단계 번호, 오른쪽 끝에 주황 동그라미 */}
            <div className="flex flex-1 items-center gap-3 rounded-sm border border-t-bevel border-l-bevel border-r-border border-b-2 border-b-border bg-card p-4 text-card-foreground shadow-hard lg:self-stretch">
              {/* 단계 번호: 검정 네모 칸 + 흰 Courier 숫자 */}
              <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-carbon font-mono text-xl font-black text-carbon-foreground">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <h3 className="font-black text-muted-foreground">{title}</h3>
                <p className="text-sm">{body}</p>
              </div>
              {/* 주황 동그라미 아이콘 (링크 줄의 화살표 원과 같은 모양) */}
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-accent-edge bg-accent text-accent-foreground">
                <Icon aria-hidden className="size-3.5" strokeWidth={3} />
              </span>
            </div>
            {/* 단계 사이 화살표: 흰 글자 + 인디고 그림자처럼 (마지막 단계 뒤에는 없음) */}
            {i < STEPS.length - 1 && (
              <span aria-hidden className="flex justify-center text-primary-foreground drop-shadow-[2px_2px_0_var(--border)]">
                <ArrowDown className="size-6 lg:hidden" strokeWidth={3} />
                <ArrowRight className="hidden size-6 lg:block" strokeWidth={3} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── 4. 마지막 권유 ─────────────────────────────────────────────────────────
// 히어로의 휴대폰 모형처럼: 기울어진 주황 받침판 위에 검정 테두리 판을 올린다
function FinalCta() {
  return (
    <section className="relative">
      {/* 뒤에 깔린 주황 판 (휴대폰 모형과 반대로 살짝 기울임) */}
      <div aria-hidden className="absolute inset-0 translate-x-2 translate-y-3 -rotate-1 rounded-[1.6rem] bg-accent" />
      {/* 앞판: 바탕색(canvas) + 검정 굵은 테두리 + 각진 그림자 */}
      <div className="relative flex flex-col items-center gap-5 rounded-[1.6rem] border-[6px] border-carbon bg-background px-6 py-10 text-center shadow-hard md:py-14">
        {/* 히어로와 같은 주황 딱지. 게임 시작 화면처럼 깜빡인다 */}
        <span className="chamfered nav-label bg-accent px-3 py-1 text-accent-foreground motion-safe:animate-pulse">★ Press Start</span>
        <h2 className="text-3xl leading-tight font-black text-primary-foreground text-shadow-hard md:text-5xl">
          내 링크 페이지,
          <br />
          <span className="text-primary">지금</span> 만들어 볼까요?
        </h2>
        {/* 히어로 버튼과 같은 모양 */}
        <GoogleLoginButton size="lg" label="Google로 시작하기" className="h-12 w-full px-6 text-base shadow-hard sm:w-auto" />
      </div>
    </section>
  );
}

// 덩어리 제목: 히어로와 같은 주황 각진 딱지(chip) + 흰 큰 제목, 끝 단어(accent)만 빨강
function SectionTitle({ id, chip, accent, children }: { id: string; chip: string; accent: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
      <span className="chamfered nav-label bg-accent px-3 py-1 text-accent-foreground">{chip}</span>
      <h2 id={id} className="text-4xl leading-tight font-black text-primary-foreground text-shadow-hard md:text-5xl">
        {children} <span className="text-primary">{accent}</span>
      </h2>
    </div>
  );
}
