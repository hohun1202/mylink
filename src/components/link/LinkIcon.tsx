// 링크 URL에 맞는 아이콘 하나를 그리는 컴포넌트입니다. (PRD F8 "링크 아이콘 규칙")
// 공개 페이지의 링크 버튼뿐 아니라, 나중에 대시보드 링크 목록(F5)에서도 그대로 씁니다.

import {
  AtSign, // X(트위터) 자리 아이콘
  Camera, // Instagram 자리 아이콘
  FolderGit2, // GitHub 자리 아이콘
  Link as LinkGlyph, // 기본 링크 아이콘 (Link 타입과 이름이 겹치지 않게 바꿔 부름)
  Mail, // 메일
  NotebookPen, // 블로그
  SquarePlay, // YouTube 자리 아이콘
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { getLinkIconKind, type LinkIconKind } from "@/lib/linkIcon"; // URL → 아이콘 종류

// 아이콘 종류 → 실제 아이콘 컴포넌트
// lucide-react 에는 브랜드 로고가 없어서(PRD 10장 8번) 지금은 비슷한 뜻의 아이콘으로 대신한다.
// 브랜드 아이콘이 정해지면 이 표 한 곳만 바꾸면 된다.
const ICONS: Record<LinkIconKind, LucideIcon> = {
  github: FolderGit2,
  youtube: SquarePlay,
  instagram: Camera,
  x: AtSign,
  blog: NotebookPen,
  mail: Mail,
  default: LinkGlyph,
};

// url 외의 속성(className, size 등)은 lucide 아이콘에 그대로 넘긴다
type LinkIconProps = LucideProps & { url: string };

export default function LinkIcon({ url, ...props }: LinkIconProps) {
  const Icon = ICONS[getLinkIconKind(url)]; // URL에 맞는 아이콘 고르기
  return <Icon aria-hidden {...props} />; // 장식용 아이콘이라 스크린리더는 건너뜀
}
