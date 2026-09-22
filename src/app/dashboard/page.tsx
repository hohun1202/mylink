// 대시보드의 "주소 담당" 파일입니다. (/dashboard · PRD 6장)
// 실제 화면은 LocalStorage를 읽어야 하므로 클라이언트 컴포넌트(DashboardView)에 맡깁니다.

import DashboardView from "@/components/dashboard/DashboardView";

export default function DashboardPage() {
  return <DashboardView />;
}
