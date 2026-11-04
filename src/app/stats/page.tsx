// 통계 페이지의 "주소 담당" 파일입니다. (/stats)
// 로그인 상태는 브라우저에서만 알 수 있으므로, 실제 화면은 클라이언트 컴포넌트(StatsView)에 맡깁니다.

import StatsView from "@/components/stats/StatsView";

export default function StatsPage() {
  return <StatsView />;
}
