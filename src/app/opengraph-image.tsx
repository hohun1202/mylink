// 일반 경로 공통 오픈 그래프 이미지입니다. (/, /mypage, /stats, /dashboard …)
// Next.js 파일 규칙: app/ 맨 위에 opengraph-image.tsx 를 두면 그 아래 모든 페이지가 이 그림을 물려받습니다.
// 자기 폴더에 opengraph-image 가 따로 있는 경로(공개 프로필 /[displayName])만 그쪽 그림을 씁니다.
//
// 디자인: 랜딩 페이지 히어로 화면을 그대로 옮긴 그림 (src/components/landing/LandingPage.tsx · LandingPreview.tsx)
//   맨 위 — 사이트 헤더 띠 (밝은 금속판 + 빨간 mylink 로고 + [Google로 로그인])
//   왼쪽 — 주황 딱지 · "Development / in One Link." · 영어·한국어 설명 · [Google로 계속하기] · 어떻게 쓰나요? ↓
//   오른쪽 — 휴대폰 미리보기 (자물쇠 주소창 · 👾 아바타 · Dev Kim · 링크 5줄 · 기울어진 주황 받침판)
// 글꼴: 사이트는 Arial·Courier New 를 쓰지만 OG 엔진에는 글꼴 파일을 넣어 줘야 해서,
//   글자 폭이 똑같게 만들어진 무료 글꼴 Arimo(= Arial)·Cousine(= Courier New) 를 쓰고, 한글은 Noto Sans KR 로 채운다.
// 요청마다 바뀌는 값이 없으므로 빌드 때 한 번 만들어 두고 계속 씁니다(정적 최적화).

import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { siGoogle } from "simple-icons"; // 구글 "G" 로고 모양 (로그인 버튼과 같은 것)
import { C, OG_SIZE, OgLinkIcon, loadGoogleFont } from "@/lib/og";

export const alt = "mylink — Development in One Link. 개발자의 모든 링크를 주소 하나로"; // <meta property="og:image:alt">
export const size = OG_SIZE; // 1200×630
export const contentType = "image/png";

// 휴대폰 미리보기의 예시 링크 (LandingPreview 의 SAMPLE_LINKS 와 같음)
const SAMPLE_LINKS = [
  { title: "GitHub — 내 코드 저장소", url: "https://github.com" },
  { title: "기술 블로그 (velog)", url: "https://velog.io" },
  { title: "YouTube 코딩 브이로그", url: "https://youtube.com" },
  { title: "Instagram", url: "https://instagram.com" },
  { title: "메일 보내기", url: "mailto:hello@example.com" },
];

// 그림에 들어가는 글자 전부 (이 글자만 담은 글꼴을 받아 온다)
const TEXT = [
  "mylink Google로 로그인 계속하기 ★ ONE PAGE · EVERY LINK Development in One Link.",
  "Showcase your git, blog, and more. 개발자의 모든 링크를, 주소 하나로 보여 주세요. 어떻게 쓰나요?",
  "dev-kim Dev Kim 프론트엔드 개발자 · 오늘도 커밋 중",
  ...SAMPLE_LINKS.map((l) => l.title),
].join("");

// 입체 금속판 테두리 (design.md bevel: 위·왼쪽 밝게, 오른쪽·아래 인디고)
const BEVEL = {
  backgroundColor: C.platinum,
  borderTop: `1.5px solid ${C.bevel}`,
  borderLeft: `1.5px solid ${C.bevel}`,
  borderRight: `1.5px solid ${C.indigo}`,
  borderBottom: `3px solid ${C.indigo}`,
  borderRadius: 3,
} as const;

// 구글 G 로고 (구글 파란색 · 로그인 버튼과 같음)
function GoogleG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#4285F4">
      <path d={siGoogle.path} />
    </svg>
  );
}

// [G Google로 …] 입체 금속판 버튼
function GoogleButton({ label, big = false }: { label: string; big?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: big ? 12 : 8,
        padding: big ? "14px 28px" : "6px 12px",
        fontSize: big ? 24 : 16,
        fontWeight: 700,
        color: C.carbon,
        ...BEVEL,
        // 히어로 버튼만 각진 그림자 (shadow-hard)
        boxShadow: big ? `4px 4px 0 ${C.carbon}` : "none",
      }}
    >
      <GoogleG size={big ? 24 : 16} />
      {label}
    </div>
  );
}

// 오른쪽 끝 주황 동그라미 > (링크 줄의 이동 표시)
function OrangeChevron() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        backgroundColor: C.orange,
        border: `1.5px solid ${C.orangeEdge}`,
      }}
    >
      <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={C.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </div>
  );
}

// 휴대폰 미리보기 (LandingPreview 를 그대로 옮김)
function Phone() {
  return (
    <div style={{ position: "relative", display: "flex", width: 350, height: 474 }}>
      {/* 뒤의 주황 받침판: 오른쪽·아래로 비껴서 살짝 기울임 */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          width: 350,
          height: 474,
          backgroundColor: C.orange,
          borderRadius: 34,
          transform: "rotate(2deg)",
        }}
      />
      {/* 휴대폰 몸체: 검정 굵은 테두리 + 각진 그림자 */}
      <div
        style={{
          position: "relative",
          width: 350,
          height: 474,
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.canvas,
          border: `8px solid ${C.carbon}`,
          borderRadius: 34,
          boxShadow: `4px 4px 0 ${C.carbon}`,
        }}
      >
        {/* 스피커 홈 */}
        <div style={{ display: "flex", alignSelf: "center", marginTop: 8, width: 66, height: 7, borderRadius: 99, backgroundColor: C.carbon }} />

        {/* 주소창: 오목한 흰 칸 + 자물쇠 + mylink/dev-kim + 커서 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: "10px 16px 0",
            padding: "6px 10px",
            backgroundColor: C.white,
            borderTop: `2.5px solid ${C.indigo}`,
            borderLeft: `2.5px solid ${C.indigo}`,
            borderRight: `1.5px solid ${C.bevel}`,
            borderBottom: `1.5px solid ${C.bevel}`,
            fontFamily: "Cousine",
            fontSize: 17,
          }}
        >
          {/* 자물쇠 아이콘 (lucide lock 모양) */}
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke={C.indigo} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <div style={{ display: "flex" }}>
            <span style={{ color: C.indigo }}>mylink/</span>
            <span style={{ color: C.carbon, fontWeight: 700 }}>dev-kim</span>
          </div>
          <div style={{ width: 2, height: 18, backgroundColor: C.carbon }} />
        </div>

        {/* 예시 프로필: 👾 아바타 · 이름 · 소개 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "12px 0 10px" }}>
          <div
            style={{
              width: 66,
              height: 66,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              border: `4px solid ${C.carbon}`,
              backgroundColor: C.white,
              boxShadow: `4px 4px 0 ${C.carbon}`,
              fontSize: 32,
            }}
          >
            👾
          </div>
          <span style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: C.white, textShadow: `3px 3px 0 ${C.indigo}` }}>Dev Kim</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.carbon }}>프론트엔드 개발자 · 오늘도 커밋 중</span>
        </div>

        {/* 예시 링크 5줄: 금속판 + 아이콘 칸 + 인디고 제목 + 주황 > */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "0 14px" }}>
          {SAMPLE_LINKS.map((l) => (
            <div key={l.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 10px", ...BEVEL }}>
              <OgLinkIcon url={l.url} size={28} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: C.indigo }}>{l.title}</span>
              <OrangeChevron />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 주황 딱지 (사이트의 "★ ONE PAGE · EVERY LINK" 딱지)
function Chip({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "7px 18px",
        backgroundColor: C.orange,
        color: C.white,
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: 1,
        // 사이트의 45° 깎은 모서리(clip-path)는 OG 엔진에서 제대로 그려지지 않아, 아주 살짝 둥근 모서리로 대신한다
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  );
}

export default async function Image() {
  // Arial 대신 Arimo(굵게), Courier New 대신 Cousine(보통·굵게), 한글은 Noto Sans KR(보통·굵게)
  const [arimo, cousine, cousineBold, notoRegular, notoBold] = await Promise.all([
    loadGoogleFont(700, TEXT, "Arimo"),
    loadGoogleFont(400, "mylink/dev-k", "Cousine"),
    loadGoogleFont(700, "mylink/dev-k", "Cousine"),
    loadGoogleFont(400, TEXT),
    loadGoogleFont(700, TEXT),
  ]);
  // 받아 온 글꼴만 넘긴다 (실패한 것은 빼기)
  const fonts = (
    [
      ["Arimo", arimo, 700],
      ["Cousine", cousine, 400],
      ["Cousine", cousineBold, 700],
      ["Noto Sans KR", notoRegular, 400],
      ["Noto Sans KR", notoBold, 700],
    ] as const
  ).flatMap(([name, data, weight]) => (data ? [{ name, data, weight, style: "normal" as const }] : []));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: C.canvas,
          fontFamily: "Arimo, Noto Sans KR", // 영문은 Arimo, Arimo 에 없는 한글은 Noto Sans KR
          color: C.carbon,
        }}
      >
        {/* 사이트 헤더 띠: 밝은 금속판 + 아래 인디고 굵은 선 */}
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
            backgroundColor: C.platinum,
            borderBottom: `3px solid ${C.indigo}`,
          }}
        >
          <span style={{ fontSize: 34, fontWeight: 700, color: C.red }}>mylink</span>
          <GoogleButton label="Google로 로그인" />
        </div>

        {/* 히어로: 왼쪽 글 · 오른쪽 휴대폰 */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px 6px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Chip>★ ONE PAGE · EVERY LINK</Chip>

            {/* 헤드라인: 흰 글자 + 인디고 각진 그림자, "One Link." 만 빨강 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 86,
                fontWeight: 700,
                lineHeight: 1.05,
                color: C.white,
                textShadow: `4px 4px 0 ${C.indigo}`,
              }}
            >
              <span>Development</span>
              <div style={{ display: "flex" }}>
                <span>in&nbsp;</span>
                <span style={{ color: C.red }}>One Link.</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 700 }}>Showcase your git, blog, and more.</span>
              <span style={{ fontSize: 20, fontWeight: 400 }}>개발자의 모든 링크를, 주소 하나로 보여 주세요.</span>
            </div>

            {/* 버튼 줄: [G Google로 계속하기]  어떻게 쓰나요? ↓ */}
            <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 6 }}>
              <GoogleButton label="Google로 계속하기" big />
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 22, fontWeight: 700 }}>
                어떻게 쓰나요?
                <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={C.carbon} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <Phone />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
