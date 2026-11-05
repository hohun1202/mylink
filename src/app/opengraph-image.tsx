// 일반 경로 공통 오픈 그래프 이미지입니다. (/, /mypage, /stats, /dashboard …)
// Next.js 파일 규칙: app/ 맨 위에 opengraph-image.tsx 를 두면 그 아래 모든 페이지가 이 그림을 물려받습니다.
// 자기 폴더에 opengraph-image 가 따로 있는 경로(공개 프로필 /[displayName])만 그쪽 그림을 씁니다.
//
// 그림 구성 (1200×630): 랜딩 페이지 히어로와 같은 모양
//   왼쪽 — 주황 딱지 · "Development in One Link." · 한국어 설명
//   오른쪽 — 휴대폰 모형 (예시 프로필 + 예시 링크 줄)
//   아래 — 검정 띠 (mylink 로고 · 슬로건)
// 요청마다 바뀌는 값이 없으므로 빌드 때 한 번 만들어 두고 계속 씁니다(정적 최적화).

import { ImageResponse } from "next/og";
import { C, HEADLINE, OG_SIZE, OgChip, OgFrame, OgPhone, loadFonts } from "@/lib/og";

export const alt = "mylink — 개발자의 모든 링크를 주소 하나로"; // <meta property="og:image:alt">
export const size = OG_SIZE; // 1200×630
export const contentType = "image/png";

// 휴대폰 안에 보여 줄 예시 링크 (실제 사용자 아님 — 랜딩 페이지 미리보기와 같은 예시)
const SAMPLE_LINKS = [
  { title: "GitHub — 내 코드 저장소", url: "https://github.com" },
  { title: "기술 블로그 (velog)", url: "https://velog.io" },
  { title: "YouTube 코딩 브이로그", url: "https://youtube.com" },
];

const SUB = "개발자의 모든 링크를, 주소 하나로.";

export default async function Image() {
  // 그림에 들어가는 글자만 담은 한글 글꼴
  const fonts = await loadFonts([SUB, "ONE PAGE EVERY LINK Development in One Link. Showcase your git, blog, and more. Dev Kim", ...SAMPLE_LINKS.map((l) => l.title)].join(""));

  return new ImageResponse(
    (
      <OgFrame>
        {/* 왼쪽: 헤드라인 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, paddingRight: 40 }}>
          <OgChip>★ ONE PAGE · EVERY LINK</OgChip>

          {/* "Development / in One Link." — "One Link." 만 빨강 (랜딩 히어로와 같음) */}
          <div style={{ display: "flex", flexDirection: "column", fontSize: 90, letterSpacing: -2, ...HEADLINE }}>
            <span>Development</span>
            <div style={{ display: "flex" }}>
              <span>in&nbsp;</span>
              <span style={{ color: C.red }}>One Link.</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: C.carbon }}>Showcase your git, blog, and more.</span>
            <span style={{ fontSize: 28, fontWeight: 700, color: C.carbon }}>{SUB}</span>
          </div>
        </div>

        {/* 오른쪽: 휴대폰 모형 — 예시 프로필 */}
        <OgPhone handle="dev-kim" links={SAMPLE_LINKS}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, margin: "0 0 2px" }}>
            {/* 예시 아바타: 흰 원 + 검정 테두리 안에 이니셜 */}
            <div
              style={{
                width: 64,
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                border: `5px solid ${C.carbon}`,
                backgroundColor: C.white,
                boxShadow: `4px 4px 0 ${C.carbon}`,
                fontSize: 28,
                fontWeight: 900,
                color: C.indigo,
              }}
            >
              DK
            </div>
            <span style={{ fontSize: 30, ...HEADLINE, textShadow: `3px 3px 0 ${C.indigo}` }}>Dev Kim</span>
          </div>
        </OgPhone>
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
