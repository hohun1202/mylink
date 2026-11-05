// 대시보드의 "주소 담당" 파일입니다. (/dashboard · PRD 6장)
// 실제 화면은 LocalStorage를 읽어야 하므로 클라이언트 컴포넌트(DashboardView)에 맡깁니다.

import type { Metadata } from "next";
import DashboardView from "@/components/dashboard/DashboardView";

// 로그인한 본인만 보는 화면이라 검색 결과에 나올 필요가 없다 → noindex (검색 엔진에 색인하지 말라고 알림)
export const metadata: Metadata = {
  title: "대시보드",
  description: "내 mylink 페이지의 링크를 한눈에 관리하는 대시보드입니다.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardView />;
}
