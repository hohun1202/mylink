// 오픈 그래프(OG) 이미지 공용 부품입니다. (카톡·슬랙·X 등에 링크를 붙였을 때 뜨는 1200×630 미리보기 그림)
// 두 파일이 같은 부품으로 "랜딩 페이지 히어로 화면"을 그립니다:
//   - src/app/opengraph-image.tsx               → 일반 경로(/, /mypage, /stats, /dashboard …) 공통 그림 (정적)
//   - src/app/[displayName]/opengraph-image.tsx → 공개 프로필(/아이디) 마다 다른 그림 (동적)
//
// OG 그림은 next/og 의 ImageResponse(내부 엔진 Satori)가 JSX 를 PNG 로 찍어 냅니다. 브라우저가 아니라서
//   - Tailwind 클래스·CSS 변수를 못 씀 → 색은 아래 C 에 16진수로 직접 적는다 (docs/design.md 와 같은 값)
//   - 레이아웃은 flexbox 만 됨 → 자식이 둘 이상인 div 에는 display:"flex" 를 꼭 붙인다
//   - React 훅을 쓰는 컴포넌트(lucide-react 아이콘 등)와 <>…</> 조각(Fragment)은 SVG 안에서 오류가 난다 → 모양을 직접 적는다
//   - calc()·clip-path 는 제대로 안 됨
//   - 서버 파일(public/ 등)을 읽지 않는다 → Vercel 서버리스 함수에는 public/ 이 들어가지 않아 배포 환경에서 실패함
//   - 글꼴을 직접 넣어 줘야 함 → heroFonts() 가 Google Fonts 에서 "그림에 쓰는 글자만" 잘라 받아 온다
//     (글꼴 전체 파일은 수 MB 라 ImageResponse 의 500KB 제한을 넘기 때문)

import type { ReactNode } from "react";
import { siGithub, siGoogle, siInstagram, siVelog, siX, siYoutube, type SimpleIcon } from "simple-icons";
import { getLinkIconKind } from "@/lib/linkIcon"; // 링크 주소 → 아이콘 종류 (화면의 링크 버튼과 같은 규칙)

// OG 이미지 표준 크기 (페이스북·카카오·X 모두 이 비율을 권장)
export const OG_SIZE = { width: 1200, height: 630 };

// 디자인 색 (docs/design.md · globals.css 와 같은 값)
export const C = {
  canvas: "#7a8aba", // 페이지 바탕
  carbon: "#21242e", // 진한 검정 (테두리·아이콘 칸)
  platinum: "#dedede", // 금속판 면
  white: "#ffffff",
  red: "#e60012", // Nintendo 빨강 (강조)
  indigo: "#3d4f97", // 테두리 그림자 쪽 · 큰 제목 그림자 · 링크 제목
  orange: "#f68d1f", // 딱지 · 화살표 원 · 받침판
  orangeEdge: "#c86a00",
  bevel: "#c8d4ee", // 테두리 빛 받는 쪽
};

// ─── 글꼴 ──────────────────────────────────────────────────────────────────

// Google Fonts 에 "이 글자들만" 담은 글꼴 파일을 달라고 해서 받아 온다 (text= 파라미터 → 아주 작은 TTF)
// 4초 안에 못 받으면(느린 네트워크·오프라인) 포기하고 null — 그림이 끝없이 로딩되지 않게 한다
export async function loadGoogleFont(weight: number, text: string, family = "Noto Sans KR"): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl, { signal: AbortSignal.timeout(4000) })).text(); // 글꼴 파일 주소가 적힌 CSS
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]; // 그 안의 TTF/OTF 주소
    if (!fontUrl) return null;
    const res = await fetch(fontUrl, { signal: AbortSignal.timeout(4000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch (err) {
    console.error(`OG 이미지 글꼴(${family} ${weight}) 불러오기 실패:`, err);
    return null;
  }
}

// 히어로 그림에 쓰는 글꼴 5개를 한 번에 받아 ImageResponse 의 fonts 옵션 모양으로 돌려준다
//   - Arimo 굵게       : 사이트의 Arial 대신 (Arial 과 글자 폭이 똑같게 만든 무료 글꼴)
//   - Cousine 보통·굵게 : 주소창의 Courier New 대신 (monoText 글자만)
//   - Noto Sans KR 보통·굵게 : Arimo 에 없는 한글
// 받기에 실패한 글꼴은 빼고 넘긴다 (그 글자는 기본 글꼴로 그려짐)
export async function heroFonts(text: string, monoText: string) {
  // 영문·숫자·기호는 어느 그림에나 나오므로(로고 mylink, 개수 등) 늘 함께 받는다 — 빠지면 그 글자만 다른 글꼴로 그려짐
  text += "mylink ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,·…★+-_/()!?";
  monoText += "mylink/…";
  const [arimo, cousine, cousineBold, notoRegular, notoBold] = await Promise.all([
    loadGoogleFont(700, text, "Arimo"),
    loadGoogleFont(400, monoText, "Cousine"),
    loadGoogleFont(700, monoText, "Cousine"),
    loadGoogleFont(400, text),
    loadGoogleFont(700, text),
  ]);
  return (
    [
      ["Arimo", arimo, 700],
      ["Cousine", cousine, 400],
      ["Cousine", cousineBold, 700],
      ["Noto Sans KR", notoRegular, 400],
      ["Noto Sans KR", notoBold, 700],
    ] as const
  ).flatMap(([name, data, weight]) => (data ? [{ name, data, weight, style: "normal" as const }] : []));
}

// ─── 글자 자르기 ───────────────────────────────────────────────────────────

// 글자 "폭" 세기: 한글·한자 같은 넓은 글자는 1칸, 영문·숫자·기호·공백은 0.6칸
export function textUnits(text: string) {
  return Array.from(text).reduce((sum, ch) => sum + (/[\u0000-ɏ]/.test(ch) ? 0.6 : 1), 0);
}

// 글자 폭으로 자르고 … 붙이기 (Satori 는 말줄임이 불안정해서 직접 자름)
export function clipWidth(text: string, maxUnits: number) {
  if (textUnits(text) <= maxUnits) return text;
  let out = "";
  for (const ch of Array.from(text)) {
    if (textUnits(out + ch) > maxUnits - 0.6) break; // … 자리를 남기고 자른다
    out += ch;
  }
  return out + "…";
}

// ─── 히어로 공통 부품 ──────────────────────────────────────────────────────

// 입체 금속판 테두리 (design.md bevel: 위·왼쪽 밝게, 오른쪽·아래 인디고)
export const BEVEL = {
  backgroundColor: C.platinum,
  borderTop: `1.5px solid ${C.bevel}`,
  borderLeft: `1.5px solid ${C.bevel}`,
  borderRight: `1.5px solid ${C.indigo}`,
  borderBottom: `3px solid ${C.indigo}`,
  borderRadius: 3,
} as const;

// 히어로 큰 제목: 흰 글자 + 인디고 각진 그림자
export const HEADLINE = {
  fontWeight: 700,
  lineHeight: 1.05,
  color: C.white,
  textShadow: `4px 4px 0 ${C.indigo}`,
} as const;

// 전체 판: canvas 바탕 + 맨 위 사이트 헤더 띠(밝은 금속판 · 빨간 mylink 로고 · 오른쪽 headerRight)
// children 은 헤더 아래 히어로 자리 (왼쪽 글 · 오른쪽 휴대폰을 나란히)
export function HeroFrame({ headerRight, children }: { headerRight: ReactNode; children: ReactNode }) {
  return (
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
        {headerRight}
      </div>

      {/* 히어로: 왼쪽 글 · 오른쪽 휴대폰 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px 6px" }}>
        {children}
      </div>
    </div>
  );
}

// 주황 딱지 (사이트의 "★ ONE PAGE · EVERY LINK" 딱지)
// 사이트의 45° 깎은 모서리(clip-path)는 OG 엔진에서 제대로 그려지지 않아, 아주 살짝 둥근 모서리로 대신한다
export function Chip({ children }: { children: ReactNode }) {
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
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  );
}

// 구글 G 로고 (구글 파란색 · 로그인 버튼과 같음)
export function GoogleG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#4285F4">
      <path d={siGoogle.path} />
    </svg>
  );
}

// 입체 금속판 버튼 (big: 히어로 큰 버튼 — 각진 그림자 / 아니면 헤더의 작은 버튼)
// mono: 글자를 고정폭(Cousine)으로 — 주소처럼 보여 줄 때
export function BevelButton({ icon, label, big = false, mono = false }: { icon: ReactNode; label: string; big?: boolean; mono?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: big ? 12 : 8,
        padding: big ? "14px 28px" : "6px 12px",
        fontSize: big ? 24 : 16,
        fontWeight: 700,
        fontFamily: mono ? "Cousine" : "Arimo, Noto Sans KR",
        color: C.carbon,
        ...BEVEL,
        boxShadow: big ? `4px 4px 0 ${C.carbon}` : "none",
      }}
    >
      {icon}
      {label}
    </div>
  );
}

// 선 아이콘 (lucide 모양을 옮긴 SVG). children 은 요소 "배열"로 준다 (Fragment 는 오류)
export function LineIcon({ size, color, children }: { size: number; color: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// 자주 쓰는 선 아이콘 모양 (lucide 의 arrow-down · arrow-right · link · lock)
export const SHAPES = {
  arrowDown: [<path key="a" d="M12 5v14" />, <path key="b" d="m19 12-7 7-7-7" />],
  arrowRight: [<path key="a" d="M5 12h14" />, <path key="b" d="m12 5 7 7-7 7" />],
  link: [
    <path key="a" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />,
    <path key="b" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
  ],
  lock: [<rect key="r" width="18" height="11" x="3" y="11" rx="2" ry="2" />, <path key="p" d="M7 11V7a5 5 0 0 1 10 0v4" />],
  mail: [<rect key="r" width="20" height="16" x="2" y="4" rx="2" />, <path key="p" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />],
  pen: [<path key="a" d="M12 20h9" />, <path key="b" d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />],
};

// ─── 링크 아이콘 칸 ────────────────────────────────────────────────────────

// 브랜드 로고 칸 색 (globals.css 의 --logo-* 와 같은 값)
const BRANDS: Record<string, { icon: SimpleIcon; bg: string }> = {
  github: { icon: siGithub, bg: "#181717" },
  youtube: { icon: siYoutube, bg: "#ff0000" },
  instagram: { icon: siInstagram, bg: "#ff0069" },
  x: { icon: siX, bg: "#000000" },
  velog: { icon: siVelog, bg: "#20c997" },
};

// 링크 주소에 맞는 아이콘 칸 (브랜드면 브랜드 색 + 로고, 아니면 검정 칸 + 선 아이콘)
export function OgLinkIcon({ url, size }: { url: string; size: number }) {
  const kind = getLinkIconKind(url);
  const brand = BRANDS[kind];
  const glyph = kind === "mail" ? SHAPES.mail : kind === "blog" ? SHAPES.pen : SHAPES.link;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        backgroundColor: brand ? brand.bg : C.carbon,
        border: `2px solid ${C.indigo}`,
      }}
    >
      {brand ? (
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill={C.white}>
          <path d={brand.icon.path} />
        </svg>
      ) : (
        <LineIcon size={size * 0.55} color={C.white}>
          {glyph}
        </LineIcon>
      )}
    </div>
  );
}

// ─── 휴대폰 미리보기 (랜딩의 LandingPreview 와 같은 모양) ─────────────────

// 링크 줄 끝 주황 동그라미 >
function OrangeChevron() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
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

// 휴대폰: 기울어진 주황 받침판 + 검정 테두리 몸체
//   주소창(mylink/handle) → 아바타(avatar) · 이름 · 소개 → 링크 줄들(+N개 더) / 링크가 없으면 empty 문구
export function HeroPhone({
  handle,
  avatar,
  name,
  bio,
  links,
  more = 0,
  empty = "아직 링크가 없어요",
}: {
  handle: string;
  avatar: ReactNode; // 동그란 아바타 칸 안에 넣을 것 (사진 <img> 또는 이모지)
  name: string;
  bio: string;
  links: { title: string; url: string }[];
  more?: number; // 다 못 보여 준 링크 수
  empty?: string;
}) {
  return (
    <div style={{ position: "relative", display: "flex", flexShrink: 0, width: 350, height: 474 }}>
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
          overflow: "hidden",
        }}
      >
        {/* 스피커 홈 */}
        <div style={{ display: "flex", alignSelf: "center", marginTop: 8, width: 66, height: 7, borderRadius: 99, backgroundColor: C.carbon }} />

        {/* 주소창: 오목한 흰 칸 + 자물쇠 + mylink/handle + 커서 */}
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
          <LineIcon size={15} color={C.indigo}>
            {SHAPES.lock}
          </LineIcon>
          <div style={{ display: "flex" }}>
            <span style={{ color: C.indigo }}>mylink/</span>
            <span style={{ color: C.carbon, fontWeight: 700 }}>{clipWidth(handle, 13)}</span>
          </div>
          <div style={{ width: 2, height: 18, backgroundColor: C.carbon }} />
        </div>

        {/* 프로필: 아바타 · 이름 · 소개 */}
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
              overflow: "hidden",
            }}
          >
            {avatar}
          </div>
          <span style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: C.white, textShadow: `3px 3px 0 ${C.indigo}` }}>
            {clipWidth(name, 15)}
          </span>
          {bio ? <span style={{ fontSize: 15, fontWeight: 700, color: C.carbon }}>{clipWidth(bio, 21)}</span> : null}
        </div>

        {/* 링크 줄들: 금속판 + 아이콘 칸 + 인디고 제목 + 주황 > */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, padding: "0 14px" }}>
          {links.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 10px", ...BEVEL }}>
              <OgLinkIcon url={l.url} size={28} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: C.indigo }}>{clipWidth(l.title, 13)}</span>
              <OrangeChevron />
            </div>
          ))}
        </div>

        {/* 더 있으면 +N개 더 / 하나도 없으면 안내 문구 */}
        {more > 0 ? (
          <span style={{ display: "flex", alignSelf: "center", marginTop: 8, fontSize: 17, fontWeight: 700, color: C.white, textShadow: `2px 2px 0 ${C.indigo}` }}>
            +{more}개 더
          </span>
        ) : null}
        {links.length === 0 ? (
          <span style={{ display: "flex", alignSelf: "center", marginTop: 60, fontSize: 20, fontWeight: 700, color: C.white, textShadow: `2px 2px 0 ${C.indigo}` }}>
            {empty}
          </span>
        ) : null}
      </div>
    </div>
  );
}
