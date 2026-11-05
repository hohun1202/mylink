// 통계 페이지의 "주소 담당" 파일입니다. (/stats)
// 로그인 상태는 브라우저에서만 알 수 있으므로, 실제 화면은 클라이언트 컴포넌트(StatsView)에 맡깁니다.

import type { Metadata } from "next";
import StatsView from "@/components/stats/StatsView";

// 로그인한 본인만 보는 화면이라 검색 결과에 나올 필요가 없다 → noindex (검색 엔진에 색인하지 말라고 알림)
export const metadata: Metadata = {
  title: "통계",
  description: "내 링크별 클릭 수를 확인하는 통계 페이지입니다.",
  robots: { index: false, follow: false },
};

export default function StatsPage() {
  return <StatsView />;
}
