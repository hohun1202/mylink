"use client"; // 로그인 상태(브라우저 전용)·Firestore 를 읽으므로 클라이언트 컴포넌트

// 통계 화면 본체입니다. (/stats)
// - 로그인 필수: 로그인 안 한 사람이 들어오면 첫 화면(/)으로 돌려보낸다 (리다이렉트)
// - 총 클릭수: 내 모든 링크의 clickCount 를 더한 값을 큰 숫자로 보여준다
// - 링크별 클릭수: shadcn/ui 차트(ChartContainer + Recharts 막대 차트)로 많이 눌린 순서대로 보여준다

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // 코드로 페이지 이동
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"; // 차트를 그리는 라이브러리 (shadcn 차트의 바탕)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer, // 차트 크기·색 변수를 잡아 주는 shadcn 상자
  ChartTooltip, // 막대에 마우스를 올리면 뜨는 말풍선
  ChartTooltipContent, // 말풍선 안의 shadcn 기본 모양
  type ChartConfig,
} from "@/components/ui/chart";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"; // 로딩 자리표시
import { useLinksQuery } from "@/lib/queries"; // 내 링크 가져오기 (TanStack Query)
import { useAuthStore } from "@/store/useAuthStore";

// 차트에 쓰는 데이터 이름표와 색. "clicks" 라는 값은 "클릭 수" 라고 부르고 인디고(#3d4f97)로 칠한다
// → ChartContainer 가 이 색을 --color-clicks 라는 CSS 변수로 만들어 준다
const chartConfig = {
  clicks: { label: "클릭 수", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export default function StatsView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady); // Firebase 가 로그인 여부를 알려 줬는지

  // 로그인 여부가 확정됐는데 로그아웃 상태면 첫 화면으로 보낸다
  // replace: 뒤로 가기 기록에 /stats 를 남기지 않는다 (뒤로 가기를 눌러도 다시 튕겨 나오는 일이 없게)
  // authReady 를 기다리는 이유: 새로고침 직후엔 잠깐 user 가 null 이라, 로그인한 사람도 쫓겨나기 때문
  useEffect(() => {
    if (authReady && !user) router.replace("/");
  }, [authReady, user, router]);

  return (
    <main className="flex flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      <div className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-3xl font-black text-primary-foreground text-shadow-hard">통계</h1>
        {/* 로그인 확인 전이거나, 리다이렉트 중이면 자리표시만 */}
        {!authReady || !user ? <ProfileSkeleton /> : <StatsBody uid={user.uid} />}
      </div>
    </main>
  );
}

// 로그인한 뒤의 화면
function StatsBody({ uid }: { uid: string }) {
  const linksQuery = useLinksQuery(uid); // Firestore 에서 내 링크 가져오기 (마이페이지와 같은 캐시를 나눠 씀)
  if (linksQuery.isError) console.error("통계용 링크 불러오기 실패:", linksQuery.error);

  if (linksQuery.isPending) return <ProfileSkeleton />;
  const links = linksQuery.data ?? [];

  // 총 클릭수 = 모든 링크의 clickCount 합. 한 번도 안 눌린 링크(필드 없음)는 0 으로 친다
  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount ?? 0), 0);

  // 차트용 데이터: [{ title: "깃허브", clicks: 3 }, ...] 를 많이 눌린 순서로 정렬
  const chartData = links
    .map((link) => ({ id: link.id, title: link.title, clicks: link.clickCount ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <>
      {/* 총 클릭수 — 숫자 하나가 주인공인 카드 */}
      <Card>
        <CardHeader>
          <CardDescription>총 클릭수 · 모든 링크 합산</CardDescription>
          {/* tabular-nums: 숫자 폭을 같게 해서 자릿수가 바뀌어도 흔들리지 않게 */}
          <CardTitle className="text-5xl font-black tabular-nums">{totalClicks.toLocaleString("ko-KR")}</CardTitle>
          <CardDescription>링크 {links.length}개</CardDescription>
        </CardHeader>
      </Card>

      {/* 링크별 클릭수 차트 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">링크별 클릭수</CardTitle>
          <CardDescription>많이 눌린 순서</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <Empty className="flex-none">
              <EmptyHeader>
                <EmptyTitle className="text-foreground">아직 링크가 없어요</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {/* 높이 = 링크 수 × 44px (+ 아래 숫자 눈금 자리). 링크가 많아지면 차트가 세로로 길어진다 */}
              <ChartContainer config={chartConfig} className="w-full" style={{ height: chartData.length * 44 + 32 }}>
                {/* layout="vertical": 막대를 가로로 눕힌다 (긴 링크 제목을 왼쪽에 읽기 쉽게 쓰려고) */}
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                  {/* 세로 보조선만 옅게 (숫자 위치를 가늠하는 용도) */}
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  {/* 아래 숫자 눈금. allowDecimals={false}: 클릭은 정수라 1.5 같은 눈금을 안 만든다 */}
                  <XAxis type="number" dataKey="clicks" allowDecimals={false} tickLine={false} axisLine={false} />
                  {/* 왼쪽 링크 제목. 9글자를 넘으면 … 으로 줄인다 (전체 제목은 말풍선·아래 표에서 보임) */}
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={96}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(title: string) => (title.length > 9 ? `${title.slice(0, 9)}…` : title)}
                  />
                  {/* 막대에 마우스를 올리면 "깃허브 · 클릭 수 3" 말풍선. cursor: 올린 줄을 옅게 칠해 표시 */}
                  <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
                  {/* 막대: 색은 chartConfig 의 clicks 색, 끝만 4px 둥글게, 두께 최대 24px */}
                  <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ChartContainer>

              {/* 같은 내용을 표로도 (차트를 못 보는 화면 낭독기 사용자 · 정확한 숫자 확인용) */}
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-1 font-bold">링크</th>
                    <th className="py-1 text-right font-bold">클릭 수</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.id} className="border-b border-border/40">
                      <td className="py-1 break-words">{row.title}</td>
                      <td className="py-1 text-right tabular-nums">{row.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
