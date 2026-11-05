// /mypage 의 "주소 담당" 파일입니다. 내 링크를 보고 바로 추가하는 화면.
// 실제 화면은 LocalStorage를 읽어야 하므로 클라이언트 컴포넌트(MyPageView)에 맡깁니다.

import type { Metadata } from "next";
import MyPageView from "@/components/mypage/MyPageView";

// 로그인한 본인만 보는 화면이라 검색 결과에 나올 필요가 없다 → noindex (검색 엔진에 색인하지 말라고 알림)
export const metadata: Metadata = {
  title: "마이페이지",
  description: "내 프로필과 링크를 보고 새 링크를 바로 추가하는 마이페이지입니다.",
  robots: { index: false, follow: false },
};

export default function MyPage() {
  return <MyPageView />;
}
