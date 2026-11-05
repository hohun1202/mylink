// 첫 화면(/) 입니다. 로그인했으면 마이페이지(내 프로필 + 링크 목록),
// 로그인하지 않았으면 소개 페이지(랜딩)를 보여줍니다.
// 로그인 상태는 브라우저에서만 알 수 있으므로 실제 화면은 클라이언트 컴포넌트(HomeView)에 맡깁니다.
// (예전 Nintendo 스타일 자기소개 페이지는 git 기록의 커밋 c0a8596 까지 남아 있음)

import type { Metadata } from "next";
import HomeView from "@/components/home/HomeView";

// 첫 화면 메타데이터. 제목·설명·미리보기는 layout.tsx 기본값을 그대로 쓰고,
// "이 페이지의 대표 주소는 / 다"(canonical)만 알려 준다 → ?utm=… 같은 꼬리표가 붙은 주소가 따로 색인되지 않게
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeView />;
}
