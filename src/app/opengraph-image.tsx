// 일반 경로 공통 오픈 그래프 이미지입니다. (/, /mypage, /stats, /dashboard …)
// Next.js 파일 규칙: app/ 맨 위에 opengraph-image.tsx 를 두면 그 아래 모든 페이지가 이 그림을 물려받습니다.
// 자기 폴더에 opengraph-image 가 따로 있는 경로(공개 프로필 /[displayName])만 그쪽 그림을 씁니다.
//
// 디자인: 랜딩 페이지 히어로 화면을 그대로 옮긴 그림 (src/components/landing/LandingPage.tsx · LandingPreview.tsx)
//   맨 위 — 사이트 헤더 띠 (밝은 금속판 + 빨간 mylink 로고 + [Google로 로그인])
//   왼쪽 — 주황 딱지 · "Development / in One Link." · 영어·한국어 설명 · [Google로 계속하기] · 어떻게 쓰나요? ↓
//   오른쪽 — 휴대폰 미리보기 (자물쇠 주소창 · 👾 아바타 · Dev Kim · 링크 5줄 · 기울어진 주황 받침판)
// 부품(헤더 띠·딱지·버튼·휴대폰)과 글꼴은 src/lib/og.tsx 에 있고, 공개 프로필 그림도 같은 부품을 씁니다.
// 요청마다 바뀌는 값이 없으므로 빌드 때 한 번 만들어 두고 계속 씁니다(정적 최적화).

import { ImageResponse } from "next/og";
import { BevelButton, C, Chip, GoogleG, HEADLINE, HeroFrame, HeroPhone, LineIcon, OG_SIZE, SHAPES, heroFonts } from "@/lib/og";

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
  "Dev Kim 프론트엔드 개발자 · 오늘도 커밋 중 …",
  ...SAMPLE_LINKS.map((l) => l.title),
].join("");

export default async function Image() {
  const fonts = await heroFonts(TEXT, "mylink/dev-kim");

  return new ImageResponse(
    (
      <HeroFrame headerRight={<BevelButton icon={<GoogleG size={16} />} label="Google로 로그인" />}>
        {/* 왼쪽: 랜딩 히어로 글 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Chip>★ ONE PAGE · EVERY LINK</Chip>

          {/* 헤드라인: 흰 글자 + 인디고 각진 그림자, "One Link." 만 빨강 */}
          <div style={{ display: "flex", flexDirection: "column", fontSize: 86, ...HEADLINE }}>
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
            <BevelButton icon={<GoogleG size={24} />} label="Google로 계속하기" big />
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 22, fontWeight: 700 }}>
              어떻게 쓰나요?
              <LineIcon size={20} color={C.carbon}>
                {SHAPES.arrowDown}
              </LineIcon>
            </div>
          </div>
        </div>

        {/* 오른쪽: 휴대폰 미리보기 (예시 프로필) */}
        <HeroPhone handle="dev-kim" avatar="👾" name="Dev Kim" bio="프론트엔드 개발자 · 오늘도 커밋 중" links={SAMPLE_LINKS} />
      </HeroFrame>
    ),
    { ...size, fonts },
  );
}
