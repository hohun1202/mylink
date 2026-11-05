// 사이트 전체가 같이 쓰는 기본 정보입니다. (검색 엔진용 메타데이터 · robots.txt · sitemap.xml)
//
// SITE_URL — 이 사이트의 "진짜 주소". 검색 엔진에 알려 주는 대표 주소(canonical)·og:url·사이트맵이
// 모두 이 값 앞에 경로를 붙여 만들어집니다.
//   1) .env.local 의 NEXT_PUBLIC_SITE_URL 을 먼저 씁니다 (배포 주소가 정해지면 여기에 적기)
//   2) 없으면 Vercel 이 자동으로 넣어 주는 운영 도메인(VERCEL_PROJECT_PRODUCTION_URL)
//   3) 그것도 없으면 개발용 http://localhost:3000
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, ""); // 끝의 "/" 는 떼어 둔다 (경로를 붙일 때 "//" 가 생기지 않게)

export const SITE_NAME = "mylink"; // 브라우저 탭·검색 결과에 붙는 서비스 이름

// 검색 결과 제목 아래 회색 설명글. 구글은 대략 120~160자까지 보여 줍니다.
export const SITE_DESCRIPTION =
  "개발자의 모든 링크를 주소 하나로. GitHub, 기술 블로그, 포트폴리오, SNS 링크를 mylink 한 페이지에 모아 Google 로그인만으로 바로 공유하세요.";

// 검색 결과에 미리보기로 보여 줄 설명은 너무 길면 잘리므로 적당히 자른다
export function clipDescription(text: string, max = 150): string {
  const oneLine = text.replace(/\s+/g, " ").trim(); // 줄바꿈·연속 공백을 한 칸으로
  return oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine;
}
