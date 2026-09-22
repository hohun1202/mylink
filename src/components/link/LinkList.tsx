// 링크 버튼들을 세로로 쌓아 보여주는 목록입니다. (PRD F8 (4))
// 링크가 하나도 없으면 shadcn/ui 의 Empty 로 안내 문구를 보여줍니다.

import { Link as LinkGlyph } from "lucide-react"; // 빈 목록 안내에 쓸 아이콘
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import LinkButton from "@/components/link/LinkButton";
import type { Link } from "@/lib/types";

type LinkListProps = {
  links: Link[]; // 보여줄 링크들. 배열 순서 = 화면 순서
  emptyMessage?: string; // 링크가 없을 때 문구 (화면마다 바꿔 쓸 수 있게)
};

export default function LinkList({
  links,
  emptyMessage = "아직 등록된 링크가 없어요",
}: LinkListProps) {
  if (links.length === 0) {
    return (
      // flex-none: Empty 기본값(flex-1)은 남는 세로 공간을 다 차지해 문구가 화면 한가운데로 내려가므로 끈다
      <Empty className="flex-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LinkGlyph />
          </EmptyMedia>
          <EmptyTitle className="text-foreground">{emptyMessage}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-3">
      {links.map((link) => (
        <li key={link.id}>
          <LinkButton link={link} />
        </li>
      ))}
    </ul>
  );
}
