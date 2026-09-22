// 공개 페이지의 링크 버튼 하나입니다. (PRD F8 — 아이콘 + 제목 + 이동 표시 ">")
// 버튼 전체가 눌리는 영역이고, 누르면 새 탭에서 열립니다.

import {
  AtSign, // X(트위터) 자리 아이콘
  Camera, // Instagram 자리 아이콘
  ChevronRight, // 오른쪽 끝 이동 표시 ">"
  FolderGit2, // GitHub 자리 아이콘
  Link as LinkIcon, // 기본 링크 아이콘 (Next.js의 Link와 이름이 겹치지 않게 바꿔 부름)
  Mail, // 메일
  NotebookPen, // 블로그
  SquarePlay, // YouTube 자리 아이콘
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button"; // shadcn 버튼 모양
import { cn } from "@/lib/utils"; // 겹치는 Tailwind 클래스를 정리해 합치는 함수
import { getLinkIconKind, type LinkIconKind } from "@/lib/linkIcon"; // URL → 아이콘 종류
import type { Link } from "@/lib/types";

// 아이콘 종류 → 실제 아이콘 컴포넌트
// lucide-react 에는 브랜드 로고가 없어서(PRD 10장 8번) 지금은 비슷한 뜻의 아이콘으로 대신한다
const ICONS: Record<LinkIconKind, LucideIcon> = {
  github: FolderGit2,
  youtube: SquarePlay,
  instagram: Camera,
  x: AtSign,
  blog: NotebookPen,
  mail: Mail,
  default: LinkIcon,
};

export default function LinkButton({ link }: { link: Link }) {
  const Icon = ICONS[getLinkIconKind(link.url)]; // URL에 맞는 아이콘 고르기

  return (
    <a
      href={link.url}
      target="_blank" // 새 탭에서 열기
      rel="noopener noreferrer" // 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정
      // cn(): 기본 모양의 whitespace-nowrap 과 block 의 whitespace-normal 처럼 겹치는 클래스 중 뒤의 것만 남긴다
      className={cn(buttonVariants({ variant: "outline", size: "block" }))}
    >
      <Icon aria-hidden /> {/* 장식용 아이콘이라 스크린리더는 건너뜀 */}
      {/* min-w-0 + break-words: 아주 긴 제목도 버튼 밖으로 넘치지 않고 줄바꿈 */}
      <span className="min-w-0 flex-1 font-medium break-words">{link.title}</span>
      <ChevronRight aria-hidden className="text-muted-foreground" />
    </a>
  );
}
