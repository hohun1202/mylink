// 링크 버튼 하나입니다. (PRD F8 — 아이콘 + 제목 + 이동 표시 ">")
// shadcn/ui 버튼의 모양(buttonVariants)을 진짜 <a> 태그에 입혀, 버튼처럼 보이지만 링크로 동작·인식되게 합니다.
// (Button 컴포넌트에 render={<a/>}를 넣으면 role="button"이 붙어 스크린리더가 "버튼"으로 읽으므로 쓰지 않음)
// 버튼 전체가 눌리는 영역이고, 누르면 새 탭에서 열립니다.

import { ChevronRight } from "lucide-react"; // 오른쪽 끝 이동 표시 ">"
import { buttonVariants } from "@/components/ui/button"; // shadcn 버튼 모양(클래스)
import { cn } from "@/lib/utils"; // 겹치는 Tailwind 클래스를 정리해 합치는 함수
import LinkIcon from "@/components/link/LinkIcon"; // URL에 맞는 아이콘
import type { Link } from "@/lib/types";

export default function LinkButton({ link }: { link: Link }) {
  return (
    <a
      href={link.url}
      target="_blank" // 새 탭에서 열기
      rel="noopener noreferrer" // 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정
      // bevel: design.md(Nintendo 2001)의 입체 금속판 모양 / block: 가로를 꽉 채우고 긴 제목은 줄바꿈
      className={cn(buttonVariants({ variant: "bevel", size: "block" }))}
    >
      {/* 아이콘 칸: 브랜드면 브랜드 색 + 로고, 아니면 검정 칸 + 아이콘 */}
      <LinkIcon url={link.url} />
      {/* min-w-0 + break-words: 아주 긴 제목도 버튼 밖으로 넘치지 않고 줄바꿈 */}
      <span className="min-w-0 flex-1 font-bold break-words text-muted-foreground group-hover/button:underline">
        {link.title}
      </span>
      {/* 주황 동그라미 화살표 = 이동 표시 ">" */}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-accent-edge bg-accent text-accent-foreground">
        <ChevronRight aria-hidden className="size-3.5" strokeWidth={3} />
      </span>
    </a>
  );
}
