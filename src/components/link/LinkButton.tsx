// 링크 버튼 하나입니다. (PRD F8 — 아이콘 + 제목 + 이동 표시 ">")
// shadcn/ui 의 Button 을 <a> 태그로 그려서, 버튼 모양 그대로 링크처럼 동작하게 합니다.
// 버튼 전체가 눌리는 영역이고, 누르면 새 탭에서 열립니다.

import { ChevronRight } from "lucide-react"; // 오른쪽 끝 이동 표시 ">"
import { Button } from "@/components/ui/button"; // shadcn 버튼
import LinkIcon from "@/components/link/LinkIcon"; // URL에 맞는 아이콘
import type { Link } from "@/lib/types";

export default function LinkButton({ link }: { link: Link }) {
  return (
    <Button
      variant="bevel" // design.md(Nintendo 2001)의 입체 금속판 모양
      size="block" // 가로를 꽉 채우고 긴 제목은 줄바꿈 (ui/button.tsx 에 추가한 크기)
      nativeButton={false} // <button> 이 아닌 다른 태그로 그린다고 Base UI에 알림
      // render: 겉모양은 Button 그대로, 실제 태그는 <a> 로 바꿔 그린다
      render={
        <a
          href={link.url}
          target="_blank" // 새 탭에서 열기
          rel="noopener noreferrer" // 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정
        />
      }
    >
      {/* 검정 네모 칸 안의 흰 아이콘 (랜딩 페이지 링크 줄의 아이콘 칸과 같은 모양) */}
      <span className="flex size-8 shrink-0 items-center justify-center border border-border bg-carbon text-carbon-foreground">
        <LinkIcon url={link.url} className="size-4" />
      </span>
      {/* min-w-0 + break-words: 아주 긴 제목도 버튼 밖으로 넘치지 않고 줄바꿈 */}
      <span className="min-w-0 flex-1 font-bold break-words text-muted-foreground group-hover/button:underline">
        {link.title}
      </span>
      {/* 주황 동그라미 화살표 = 이동 표시 ">" */}
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-accent-edge bg-accent text-accent-foreground">
        <ChevronRight aria-hidden className="size-3.5" strokeWidth={3} />
      </span>
    </Button>
  );
}
