"use client"; // 로그인 상태(브라우저 전용)·Firestore 를 읽으므로 클라이언트 컴포넌트

// 통계 화면 본체입니다. (/stats)
// - 로그인 필수: 로그인 안 한 사람이 들어오면 첫 화면(/)으로 돌려보낸다 (리다이렉트)
// - 총 클릭수: 내 모든 링크의 clickCount 를 더한 값을 큰 숫자로 보여준다 (+ 링크 수 · 1위 링크 · 링크당 평균)
// - 링크별 클릭수: shadcn/ui 차트(ChartContainer + Recharts 막대 차트)로 많이 눌린 순서대로 보여준다
// - 순위표: 링크 아이콘 · 제목 · 클릭 수 · 전체 중 몇 % 인지
// 디자인은 사이트 전체와 같은 "Nintendo 2001 금속판" (docs/design.md):
//   입체 테두리 판(Plate) + 인디고 라벨 띠(SectionBar) + 각진 그림자 + Courier 숫자

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation"; // 코드로 페이지 이동
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"; // 차트를 그리는 라이브러리 (shadcn 차트의 바탕)
import { MousePointerClick } from "lucide-react";
import {
  ChartContainer, // 차트 크기·색 변수를 잡아 주는 shadcn 상자
  ChartTooltip, // 막대에 마우스를 올리면 뜨는 말풍선
  ChartTooltipContent, // 말풍선 안의 shadcn 기본 모양
  type ChartConfig,
} from "@/components/ui/chart";
import LinkIcon from "@/components/link/LinkIcon"; // 링크 주소에 맞는 아이콘 칸 (링크 버튼과 같은 것)
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"; // 로딩 자리표시
import { useLinksQuery } from "@/lib/queries"; // 내 링크 가져오기 (TanStack Query)
import type { Link } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

// 차트에 쓰는 데이터 이름표와 색. "clicks" 라는 값은 "클릭 수" 라고 부르고 인디고(#3d4f97)로 칠한다
// → ChartContainer 가 이 색을 --color-clicks 라는 CSS 변수로 만들어 준다
const chartConfig = {
  clicks: { label: "클릭 수", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

// 숫자를 "1,234" 처럼 세 자리마다 쉼표
const formatNumber = (n: number) => n.toLocaleString("ko-KR");

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
        {/* 큰 제목: 흰 글자 + 인디고 각진 그림자 (다른 페이지 제목과 같은 모양) */}
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-primary-foreground text-shadow-hard">통계</h1>
          <p className="text-sm font-bold text-foreground">내 링크가 얼마나 눌렸는지 한눈에</p>
        </header>
        {/* 로그인 확인 전이거나, 리다이렉트 중이면 자리표시만 */}
        {!authReady || !user ? <ProfileSkeleton /> : <StatsBody uid={user.uid} />}
      </div>
    </main>
  );
}

// 로그인한 뒤: Firestore 에서 링크를 가져와 화면(StatsContent)에 넘긴다
function StatsBody({ uid }: { uid: string }) {
  const linksQuery = useLinksQuery(uid); // 마이페이지와 같은 캐시를 나눠 씀
  if (linksQuery.isError) console.error("통계용 링크 불러오기 실패:", linksQuery.error);
  if (linksQuery.isPending) return <ProfileSkeleton />;
  return <StatsContent links={linksQuery.data ?? []} />;
}

// 실제 통계 화면 (링크 목록만 받으면 그릴 수 있게 따로 뺐다)
export function StatsContent({ links }: { links: Link[] }) {
  // 링크마다 { 제목, 클릭 수 } 로 정리하고 많이 눌린 순서로 정렬. clickCount 가 없으면(한 번도 안 눌림) 0
  const rows = links
    .map((link) => ({ id: link.id, title: link.title, url: link.url, clicks: link.clickCount ?? 0 }))
    .sort((a, b) => b.clicks - a.clicks);

  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0); // 총 클릭수 = 모든 링크 합
  const top = totalClicks > 0 ? rows[0] : null; // 1위 링크 (아직 클릭이 하나도 없으면 없음)
  // 링크당 평균 (소수 첫째 자리까지). 링크가 없으면 0
  const average = rows.length > 0 ? Math.round((totalClicks / rows.length) * 10) / 10 : 0;

  return (
    <>
      {/* ① 총 클릭수 판 */}
      <Plate>
        <SectionBar icon={<MousePointerClick aria-hidden className="size-3.5" />}>Total Clicks · 총 클릭수</SectionBar>
        <div className="flex flex-col items-center gap-1 px-4 pt-6 pb-5">
          {/* 주인공 숫자: Courier(숫자용 글꼴) · 아주 크게 · 진한 글자 + 인디고 각진 그림자 (밝은 판 위에서도 또렷하게)
              tabular-nums: 숫자 폭을 같게 해서 자릿수가 바뀌어도 흔들리지 않게 */}
          <p className="font-mono text-6xl font-black text-foreground tabular-nums [text-shadow:3px_3px_0_var(--bevel)]">
            {formatNumber(totalClicks)}
          </p>
          <p className="text-xs font-bold text-muted-foreground">모든 링크를 더한 클릭 수</p>
        </div>

        {/* 작은 숫자 3칸: 링크 수 · 1위 링크 · 링크당 평균. 오목하게 들어간 칸(bevel-inset) */}
        <dl className="grid grid-cols-3 gap-2 px-3 pb-3">
          <MiniStat label="링크" value={`${rows.length}개`} />
          <MiniStat label="1위" value={top ? top.title : "—"} />
          <MiniStat label="평균" value={`${average}회`} />
        </dl>
      </Plate>

      {/* ② 링크별 클릭수 차트 판 */}
      <Plate>
        <SectionBar>Clicks by Link · 링크별 클릭수</SectionBar>
        <div className="p-3">
          {rows.length === 0 ? (
            <EmptyNote>아직 링크가 없어요. 마이페이지에서 링크를 추가해 보세요</EmptyNote>
          ) : totalClicks === 0 ? (
            <EmptyNote>아직 눌린 링크가 없어요. 내 페이지 주소를 공유해 보세요</EmptyNote>
          ) : (
            // 높이 = 링크 수 × 40px (+ 아래 숫자 눈금 자리). 링크가 많아지면 차트가 세로로 길어진다
            <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: rows.length * 40 + 28 }}>
              {/* layout="vertical": 막대를 가로로 눕힌다 (긴 링크 제목을 왼쪽에 읽기 쉽게 쓰려고) */}
              <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 28, top: 0, bottom: 0 }}>
                {/* 세로 보조선만 옅게 (숫자 위치를 가늠하는 용도) */}
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.2} />
                {/* 아래 숫자 눈금. allowDecimals={false}: 클릭은 정수라 1.5 같은 눈금을 안 만든다 */}
                <XAxis
                  type="number"
                  dataKey="clicks"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--foreground)", fontSize: 11 }}
                />
                {/* 왼쪽 링크 제목. 8글자를 넘으면 … 으로 줄인다 (전체 제목은 말풍선·아래 순위표에서 보임) */}
                <YAxis
                  type="category"
                  dataKey="title"
                  width={88}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 700 }}
                  tickFormatter={(title: string) => (title.length > 8 ? `${title.slice(0, 8)}…` : title)}
                />
                {/* 막대에 마우스를 올리면 "깃허브 · 클릭 수 3" 말풍선. cursor: 올린 줄을 옅게 칠해 표시 */}
                <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent />} />
                {/* 막대: 색은 chartConfig 의 clicks 색, 끝만 4px 둥글게, 두께 최대 20px */}
                <Bar dataKey="clicks" fill="var(--color-clicks)" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {/* 막대 끝에 숫자 (몇 번인지 바로 읽히게) */}
                  <LabelList dataKey="clicks" position="right" className="fill-foreground font-mono text-xs font-bold" />
                </Bar>
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </Plate>

      {/* ③ 순위표 판 — 차트와 같은 숫자를 표로 (화면 낭독기 사용자 · 정확한 숫자 확인용) */}
      {rows.length > 0 && (
        <Plate>
          <SectionBar>Ranking · 순위</SectionBar>
          <ol className="flex flex-col">
            {rows.map((row, i) => {
              // 전체 클릭 중 이 링크가 차지하는 비율 (%). 총 클릭이 0 이면 0%
              const share = totalClicks > 0 ? Math.round((row.clicks / totalClicks) * 100) : 0;
              return (
                <li key={row.id} className="flex items-center gap-3 border-b border-border/25 px-3 py-2 last:border-b-0">
                  {/* 순위 번호: 1위만 주황 원(사이트의 포인트 색), 나머지는 인디고 글자 */}
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black",
                      i === 0 && row.clicks > 0
                        ? "border border-accent-edge bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <LinkIcon url={row.url} />
                  {/* min-w-0 + break-words: 긴 제목도 칸 밖으로 넘치지 않게 */}
                  <span className="min-w-0 flex-1 font-bold break-words text-muted-foreground">{row.title}</span>
                  {/* 클릭 수 + 비율 */}
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-base font-black text-foreground tabular-nums">
                      {formatNumber(row.clicks)}
                    </span>
                    <span className="block text-[11px] text-foreground/70 tabular-nums">{share}%</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Plate>
      )}
    </>
  );
}

// 금속판: 밝은 면 + 위·왼쪽 밝은 테두리, 오른쪽·아래 인디고 테두리 + 번지지 않는 각진 그림자 (design.md 4장)
function Plate({ children }: { children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-sm border border-t-bevel border-l-bevel border-r-border border-b-2 border-b-border bg-card text-card-foreground shadow-hard">
      {children}
    </section>
  );
}

// 판 맨 위의 인디고 라벨 띠: 흰 글자 11px 굵은 대문자 (design.md 3장 "작은 라벨")
function SectionBar({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h2 className="nav-label flex items-center gap-1.5 bg-border px-3 py-1.5 text-white">
      {icon}
      {children}
    </h2>
  );
}

// 작은 숫자 칸 하나 (이름표 위, 값 아래). bevel-inset: 판에 오목하게 파인 칸처럼 보이는 테두리
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bevel-inset flex min-w-0 flex-col items-center gap-0.5 bg-muted px-2 py-2">
      <dt className="nav-label text-muted-foreground">{label}</dt>
      {/* truncate: 1위 링크 제목이 길면 … 으로 줄인다 (title 속성으로 마우스를 올리면 전체가 보임) */}
      <dd className="w-full truncate text-center text-sm font-black text-foreground" title={value}>
        {value}
      </dd>
    </div>
  );
}

// 차트 자리에 보여 줄 안내 문구 (링크가 없거나 클릭이 0 일 때)
function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm font-bold text-muted-foreground">{children}</p>;
}
