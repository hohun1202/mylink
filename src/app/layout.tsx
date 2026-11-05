import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import QueryProvider from "@/components/providers/QueryProvider"; // TanStack Query 캐시를 앱 전체에 연결
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"; // 사이트 주소·이름·설명 (메타데이터 공용)
import { Toaster } from "@/components/ui/sonner"; // 토스트 알림이 뜨는 자리 // 모든 페이지 위에 붙는 헤더 (로그인/로그아웃)

// 이 사이트는 2001년 웹 느낌을 위해 Arial/Courier만 씁니다(globals.css).
// 따라서 웹폰트를 따로 내려받지 않습니다 — 방문자 로딩 속도를 위해서입니다.

// 모든 페이지에 기본으로 붙는 메타데이터(<head> 안의 <title>, <meta> 들)입니다. 검색 엔진(SEO)용.
// 각 페이지(page.tsx)가 title·description 등을 따로 내보내면 그 값이 이 기본값을 덮어씁니다.
export const metadata: Metadata = {
  // 상대 주소("/", "/hohun1202")를 완전한 주소(https://…)로 바꿀 때 앞에 붙이는 기준 주소
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 개발자의 모든 링크를 주소 하나로`, // 자기 제목이 없는 페이지에 쓰는 제목
    template: `%s | ${SITE_NAME}`, // 하위 페이지 제목 뒤에 " | mylink" 를 붙인다 (예: "통계 | mylink")
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["mylink", "링크트리", "링크 모음", "개발자 포트폴리오", "프로필 링크", "GitHub", "기술 블로그", "link in bio"],
  authors: [{ name: "장호현 (Hohyeon Jang)", url: "https://github.com/hohun1202" }],
  creator: "장호현 (Hohyeon Jang)",
  // robots(색인 허용 여부)는 여기서 정하지 않는다. 안 쓰면 검색 엔진 기본값이 "색인 허용"이고,
  // 여기서 index 를 적으면 404 화면에 Next.js 가 붙이는 noindex 와 서로 어긋난 태그가 두 개 생긴다.
  // 로그인 전용 화면(/dashboard 등)만 각자 page.tsx 에서 noindex 를 붙인다.
  // 카톡·슬랙·페이스북 등에 링크를 붙였을 때 뜨는 미리보기 카드 (그림은 opengraph-image.tsx 가 자동으로 붙임)
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    title: `${SITE_NAME} — 개발자의 모든 링크를 주소 하나로`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  // X(트위터)용 미리보기 카드: 큰 그림 형태 (그림은 og:image 를 그대로 씀)
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 개발자의 모든 링크를 주소 하나로`,
    description: SITE_DESCRIPTION,
  },
  // iOS 사파리가 숫자·주소를 멋대로 전화·지도 링크로 바꾸지 않게
  formatDetection: { telephone: false, email: false, address: false },
  // 링크 제목·영문 이름이 많아 크롬이 영어 페이지로 착각하고 번역을 제안합니다.
  // <meta name="google" content="notranslate"> 로 번역 팝업을 끕니다.
  other: { google: "notranslate" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      translate="no" // 페이지 전체를 자동 번역 대상에서 뺍니다
      className={cn("h-full antialiased", "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {/* 헤더·각 페이지가 모두 같은 데이터 캐시를 쓰도록 감싼다 */}
        <QueryProvider>
          <Header />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
