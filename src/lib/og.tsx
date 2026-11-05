// 오픈 그래프(OG) 이미지 공용 부품입니다. (카톡·슬랙·X 등에 링크를 붙였을 때 뜨는 1200×630 미리보기 그림)
// 두 파일이 같이 씁니다:
//   - src/app/opengraph-image.tsx               → 일반 경로(/, /mypage, /stats, /dashboard …) 공통 그림
//   - src/app/[displayName]/opengraph-image.tsx → 공개 프로필(/아이디) 마다 다른 그림
//
// OG 그림은 next/og 의 ImageResponse(내부 엔진 Satori)가 JSX 를 PNG 로 찍어 냅니다. 브라우저가 아니라서
//   - Tailwind 클래스·CSS 변수를 못 씀 → 색은 아래 C 에 16진수로 직접 적는다 (docs/design.md 와 같은 값)
//   - 레이아웃은 flexbox 만 됨 → 자식이 둘 이상인 div 에는 display:"flex" 를 꼭 붙인다
//   - 글꼴을 직접 넣어 줘야 한글이 나옴 → loadFonts() 가 Google Fonts 에서 "그림에 쓰는 글자만" 잘라 받아 온다
//     (Noto Sans KR 전체 파일은 수 MB 라 ImageResponse 의 500KB 제한을 넘기 때문)

import type { ReactNode } from "react";
import { siGithub, siInstagram, siVelog, siX, siYoutube, type SimpleIcon } from "simple-icons";
import { getLinkIconKind } from "@/lib/linkIcon"; // 링크 주소 → 아이콘 종류 (화면의 링크 버튼과 같은 규칙)

// OG 이미지 표준 크기 (페이스북·카카오·X 모두 이 비율을 권장)
export const OG_SIZE = { width: 1200, height: 630 };

// 디자인 색 (docs/design.md · globals.css 와 같은 값)
export const C = {
  canvas: "#7a8aba", // 페이지 바탕
  carbon: "#21242e", // 진한 검정 (테두리·아이콘 칸·아래 띠)
  platinum: "#dedede", // 금속판 면
  white: "#ffffff",
  red: "#e60012", // Nintendo 빨강 (강조)
  indigo: "#3d4f97", // 테두리 그림자 쪽 · 큰 제목 그림자 · 링크 제목
  orange: "#f68d1f", // 딱지 · 화살표 원 · 받침판
  orangeEdge: "#c86a00",
  bevel: "#c8d4ee", // 테두리 빛 받는 쪽
  ice: "#c0d5e6",
};

// ─── 글꼴 ──────────────────────────────────────────────────────────────────

// Google Fonts 에 "이 글자들만" 담은 글꼴 파일을 달라고 해서 받아 온다 (text= 파라미터 → 아주 작은 TTF)
// 실패하면(오프라인 등) null — 그때는 ImageResponse 기본 글꼴로 그려지고 한글은 빈칸으로 나올 수 있다
async function loadGoogleFont(weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text(); // 글꼴 파일 주소가 적힌 CSS
    const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]; // 그 안의 TTF/OTF 주소
    if (!fontUrl) return null;
    const res = await fetch(fontUrl);
    return res.ok ? await res.arrayBuffer() : null;
  } catch (err) {
    console.error("OG 이미지 글꼴 불러오기 실패:", err);
    return null;
  }
}

// 그림에 들어가는 모든 글자(text)로 굵기 2가지(700 · 900)를 받아 ImageResponse 의 fonts 옵션 모양으로 돌려준다
export async function loadFonts(text: string) {
  // 숫자·영문·기호는 늘 쓰므로 기본으로 넣어 둔다 (+N개 더, mylink/ 등)
  const chars = Array.from(new Set(text + "0123456789+/·…★→ abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-_")).join("");
  const [bold, black] = await Promise.all([loadGoogleFont(700, chars), loadGoogleFont(900, chars)]);
  return [
    ...(bold ? [{ name: "Noto Sans KR", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(black ? [{ name: "Noto Sans KR", data: black, weight: 900 as const, style: "normal" as const }] : []),
  ];
}

// 너무 긴 글은 n 글자에서 자르고 … 를 붙인다 (Satori 는 말줄임이 불안정해서 직접 자름)
export function clip(text: string, n: number) {
  const chars = Array.from(text); // 한글·이모지도 한 글자로 세기
  return chars.length > n ? chars.slice(0, n - 1).join("") + "…" : text;
}

// 글자 "폭"으로 자르기: 한글·한자 같은 넓은 글자는 1칸, 영문·숫자·기호·공백은 0.6칸으로 셈
// (링크 제목처럼 한글·영어가 섞인 글을 휴대폰 한 줄 폭에 맞출 때 씀)
export function clipWidth(text: string, maxUnits: number) {
  let used = 0;
  let out = "";
  for (const ch of Array.from(text)) {
    const w = /[\u0000-\u024f]/.test(ch) ? 0.6 : 1; // 라틴 문자 범위면 좁은 글자
    if (used + w > maxUnits - 0.6) return out + "…"; // … 자리를 남기고 자른다
    used += w;
    out += ch;
  }
  return out;
}

// ─── 공통 틀 ───────────────────────────────────────────────────────────────

// 전체 판: canvas 바탕 + 촘촘한 흰 망점 무늬(halftone) + 맨 아래 검정 띠(mylink 로고 · 슬로건)
export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: C.canvas,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.13) 1.5px, transparent 1.5px)",
        backgroundSize: "12px 12px",
        fontFamily: "Noto Sans KR",
        color: C.carbon,
      }}
    >
      {/* 본문 자리 */}
      <div style={{ flex: 1, display: "flex", padding: "56px 72px 40px" }}>{children}</div>

      {/* 아래 검정 띠: 사이트 헤더처럼 위쪽에 인디고 굵은 선 */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 72px",
          backgroundColor: C.carbon,
          borderTop: `4px solid ${C.indigo}`,
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 900, color: C.red }}>mylink</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: 2 }}>DEVELOPMENT IN ONE LINK.</span>
      </div>
    </div>
  );
}

// 주황 딱지 (랜딩 페이지의 "★ ONE PAGE · EVERY LINK" 와 같은 것)
export function OgChip({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignSelf: "flex-start",
        padding: "6px 18px",
        backgroundColor: C.orange,
        color: C.white,
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: 2,
        borderRadius: 4,
      }}
    >
      {children}
    </div>
  );
}

// 흰 글자 + 인디고 각진 그림자 큰 제목용 스타일
export const HEADLINE = {
  color: C.white,
  fontWeight: 900,
  textShadow: `5px 5px 0 ${C.indigo}`,
  lineHeight: 1.05,
} as const;

// ─── 링크 줄 · 휴대폰 모형 ─────────────────────────────────────────────────

// 브랜드 로고 칸 색 (globals.css 의 --logo-* 와 같은 값)
const BRANDS: Record<string, { icon: SimpleIcon; bg: string }> = {
  github: { icon: siGithub, bg: "#181717" },
  youtube: { icon: siYoutube, bg: "#ff0000" },
  instagram: { icon: siInstagram, bg: "#ff0069" },
  x: { icon: siX, bg: "#000000" },
  velog: { icon: siVelog, bg: "#20c997" },
};

// 브랜드가 아닌 링크의 선 아이콘 (lucide 의 link · mail · pencil 모양을 그대로 옮긴 SVG 조각)
// lucide-react 컴포넌트는 내부에서 React 훅(useContext)을 써서 OG 엔진(Satori)에서 그리면 실패하므로, 모양만 직접 적는다
// (SVG 안에서는 <>…</> 조각(Fragment)도 Satori 가 처리하지 못해 오류가 나므로, 요소 배열로 둔다)
const GLYPHS = {
  mail: [
    <rect key="r" width="20" height="16" x="2" y="4" rx="2" />,
    <path key="p" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />,
  ],
  blog: [<path key="a" d="M12 20h9" />, <path key="b" d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />],
  default: [
    <path key="a" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />,
    <path key="b" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
  ],
};

// 링크 주소에 맞는 아이콘 칸 (브랜드면 브랜드 색 + 로고, 아니면 검정 칸 + 선 아이콘)
function OgLinkIcon({ url, size }: { url: string; size: number }) {
  const kind = getLinkIconKind(url);
  const brand = BRANDS[kind];
  const glyph = kind === "mail" ? GLYPHS.mail : kind === "blog" ? GLYPHS.blog : GLYPHS.default;
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
        // 브랜드 로고: 꽉 찬(fill) 흰 모양
        <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill={C.white}>
          <path d={brand.icon.path} />
        </svg>
      ) : (
        // 선 아이콘: 속은 비우고 흰 선만
        <svg
          viewBox="0 0 24 24"
          width={size * 0.55}
          height={size * 0.55}
          fill="none"
          stroke={C.white}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {glyph}
        </svg>
      )}
    </div>
  );
}

// 링크 한 줄: 입체 금속판 + 아이콘 칸 + 인디고 굵은 제목 + 주황 동그라미 화살표 (화면의 LinkButton 과 같은 모양)
function OgLinkRow({ title, url }: { title: string; url: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 14px",
        backgroundColor: C.platinum,
        borderTop: `2px solid ${C.bevel}`,
        borderLeft: `2px solid ${C.bevel}`,
        borderRight: `2px solid ${C.indigo}`,
        borderBottom: `4px solid ${C.indigo}`,
        borderRadius: 3,
      }}
    >
      <OgLinkIcon url={url} size={40} />
      {/* 한 줄로만: 휴대폰 폭(한글 약 10자)을 넘으면 자르고 … */}
      <span style={{ flex: 1, fontSize: 21, fontWeight: 700, color: C.indigo, whiteSpace: "nowrap", overflow: "hidden" }}>
        {clipWidth(title, 10.5)}
      </span>
      <div
        style={{
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          backgroundColor: C.orange,
          border: `2px solid ${C.orangeEdge}`,
          color: C.white,
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        →
      </div>
    </div>
  );
}

// 휴대폰 모형: 기울어진 주황 받침판 위에 검정 테두리 휴대폰 (랜딩 페이지 미리보기와 같은 모양)
// handle 은 주소창에, children 은 화면 위쪽(프로필 등)에, links 는 아래 링크 줄로 들어간다
export function OgPhone({
  handle,
  links,
  more = 0,
  children,
}: {
  handle: string;
  links: { title: string; url: string }[];
  more?: number; // 다 못 보여 준 링크 수 → "+N개 더"
  children?: ReactNode;
}) {
  return (
    <div style={{ position: "relative", display: "flex", width: 400, height: 470 }}>
      {/* 뒤의 주황 받침판 */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          width: 400,
          height: 470,
          backgroundColor: C.orange,
          borderRadius: 40,
          transform: "rotate(3deg)",
        }}
      />
      {/* 휴대폰 몸체 */}
      <div
        style={{
          position: "relative",
          width: 400,
          height: 470,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "14px 20px 20px",
          backgroundColor: C.canvas,
          border: `10px solid ${C.carbon}`,
          borderRadius: 40,
          boxShadow: `6px 6px 0 ${C.carbon}`,
          overflow: "hidden",
        }}
      >
        {/* 스피커 홈 */}
        <div style={{ display: "flex", alignSelf: "center", width: 70, height: 8, borderRadius: 99, backgroundColor: C.carbon }} />
        {/* 주소창: 오목하게 파인 흰 칸 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 12px",
            backgroundColor: C.white,
            borderTop: `3px solid ${C.indigo}`,
            borderLeft: `3px solid ${C.indigo}`,
            borderRight: `2px solid ${C.bevel}`,
            borderBottom: `2px solid ${C.bevel}`,
            fontSize: 20,
          }}
        >
          <span style={{ color: C.indigo, fontWeight: 700 }}>mylink/</span>
          <span style={{ color: C.carbon, fontWeight: 900 }}>{clip(handle, 18)}</span>
        </div>

        {children}

        {/* 링크 줄들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {links.map((l, i) => (
            <OgLinkRow key={i} title={l.title} url={l.url} />
          ))}
        </div>
        {more > 0 && (
          <div style={{ display: "flex", alignSelf: "center", fontSize: 20, fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.indigo}` }}>
            +{more}개 더
          </div>
        )}
      </div>
    </div>
  );
}
