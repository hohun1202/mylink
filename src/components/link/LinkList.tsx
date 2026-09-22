"use client"; // 삭제 확인 창의 열림 상태를 다루므로 클라이언트 컴포넌트

// 링크 버튼들을 세로로 쌓아 보여주는 목록입니다. (PRD F8 (4))
// 링크가 하나도 없으면 shadcn/ui 의 Empty 로 안내 문구를 보여줍니다.
// deletableHandle 을 주면(내 페이지) 링크를 우클릭(휴대폰은 길게 누르기)해서 삭제할 수 있습니다.
// 삭제는 바로 되지 않고 확인 창에서 한 번 더 눌러야 합니다. (PRD F5 · 시나리오 B-4)

import { useState } from "react";
import { Link as LinkGlyph, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import LinkButton from "@/components/link/LinkButton";
import type { Link } from "@/lib/types";
import { useProfileStore } from "@/store/useProfileStore";

type LinkListProps = {
  links: Link[]; // 보여줄 링크들. 배열 순서 = 화면 순서
  emptyMessage?: string; // 링크가 없을 때 문구 (화면마다 바꿔 쓸 수 있게)
  deletableHandle?: string; // 이 값이 있으면 우클릭 삭제를 켠다 (링크가 속한 프로필의 핸들)
};

export default function LinkList({
  links,
  emptyMessage = "아직 등록된 링크가 없어요",
  deletableHandle,
}: LinkListProps) {
  const removeLink = useProfileStore((s) => s.removeLink); // 스토어의 삭제 동작
  const [pending, setPending] = useState<Link | null>(null); // 삭제 확인 창에 띄운 링크 (없으면 창 닫힘)

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

  // 보기 전용 목록 (다른 사람 페이지)
  if (!deletableHandle) {
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

  // 삭제 확정: 스토어에서 지우고(LocalStorage에도 자동 반영) 확인 창을 닫는다
  function confirmDelete() {
    if (pending) removeLink(deletableHandle!, pending.id);
    setPending(null);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <ul className="flex w-full flex-col gap-3">
        {links.map((link) => (
          // 링크마다 우클릭 메뉴를 붙인다. render={<li />}: 메뉴를 여는 영역을 목록 칸(li) 자체로 만든다
          <ContextMenu key={link.id}>
            <ContextMenuTrigger render={<li />}>
              <LinkButton link={link} />
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem variant="destructive" onClick={() => setPending(link)}>
                <Trash2 aria-hidden />
                삭제
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </ul>
      {/* 우클릭은 눈에 보이지 않는 기능이라 사용법을 적어 둔다 */}
      <p className="text-center text-xs font-bold text-foreground">
        링크에 마우스를 올리고 우클릭하면 삭제할 수 있어요 (휴대폰은 길게 누르기)
      </p>

      {/* 삭제 확인 창: 링크 하나당 창을 만들지 않고, 목록 전체가 창 하나를 같이 쓴다 */}
      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이 링크를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{pending?.title}&rdquo; 링크가 목록에서 사라져요. 되돌릴 수 없어요.
              {/* 주소는 길 수 있어 따로 한 줄에, 넘치면 아무 글자에서나 줄바꿈 */}
              <span className="mt-1 block text-xs break-all">{pending?.url}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
