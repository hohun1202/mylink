"use client"; // 수정 중인 링크·삭제 확인 창 상태를 다루므로 클라이언트 컴포넌트

// 링크 버튼들을 세로로 쌓아 보여주는 목록입니다. (PRD F8 (4))
// 링크가 하나도 없으면 shadcn/ui 의 Empty 로 안내 문구를 보여줍니다.
// editableHandle 을 주면(내 페이지) 링크 카드마다 [수정]·[삭제] 버튼이 항상 보입니다.
// - 수정: 카드 자리에 인라인 수정 폼이 펼쳐집니다 (EditLinkForm · 시나리오 B-3)
// - 삭제: 확인 모달에서 한 번 더 눌러야 지워집니다 (DeleteLinkDialog · 시나리오 B-4)
// loading 을 주면(Firestore 에서 불러오는 중) 위에 "불러오는 중" 줄을 띄우고 목록을 흐리게 잠급니다.

import { useState } from "react";
import { Link as LinkGlyph, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton"; // 회색 자리표시 상자
import DeleteLinkDialog from "@/components/link/DeleteLinkDialog"; // 삭제 확인 모달
import EditLinkForm from "@/components/link/EditLinkForm"; // 인라인 수정 폼
import LinkButton from "@/components/link/LinkButton";
import type { Link } from "@/lib/types";

type LinkListProps = {
  links: Link[]; // 보여줄 링크들. 배열 순서 = 화면 순서
  emptyMessage?: string; // 링크가 없을 때 문구 (화면마다 바꿔 쓸 수 있게)
  editableHandle?: string; // 이 값이 있으면 수정·삭제 버튼을 켠다 (링크가 속한 프로필의 핸들)
  loading?: boolean; // Firestore 에서 불러오는 중인지
};

export default function LinkList({ loading = false, ...props }: LinkListProps) {
  // 불러오는 중이 아니면 평소 목록 그대로
  if (!loading) return <LinkListBody {...props} />;

  return (
    // aria-busy: 화면 낭독기에 "이 영역은 아직 바뀌는 중"이라고 알려 준다
    <div className="flex w-full flex-col gap-3" aria-busy>
      {/* 불러오는 중 안내 줄. role="status": 화면 낭독기가 이 문구를 읽어 준다 */}
      <p role="status" className="flex items-center justify-center gap-2 text-sm font-bold text-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden /> {/* 빙글빙글 도는 아이콘 */}
        링크를 불러오는 중…
      </p>
      {props.links.length === 0 ? (
        // 보여줄 링크가 아직 없으면 "링크가 없어요" 대신 버튼 모양 회색 상자를 깔아 둔다
        [0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-sm" />)
      ) : (
        // 이전 목록은 흐리게(opacity-50) 보여주고, 바뀌기 전까지 누르거나 삭제하지 못하게(pointer-events-none) 잠근다
        <div className="pointer-events-none opacity-50">
          <LinkListBody {...props} />
        </div>
      )}
    </div>
  );
}

// 실제 링크 목록 (빈 목록 안내 · 보기 전용 · 수정·삭제 버튼)
function LinkListBody({
  links,
  emptyMessage = "아직 등록된 링크가 없어요",
  editableHandle,
}: LinkListProps) {
  const [editingId, setEditingId] = useState<string | null>(null); // 지금 인라인 수정 중인 링크 id (한 번에 하나만)
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
  if (!editableHandle) {
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

  return (
    <>
      <ul className="flex w-full flex-col gap-3">
        {links.map((link) =>
          link.id === editingId ? (
            // 수정 중인 카드는 그 자리에서 입력 폼으로 바뀐다
            <li key={link.id}>
              <EditLinkForm link={link} handle={editableHandle} onDone={() => setEditingId(null)} />
            </li>
          ) : (
            // 링크 버튼 오른쪽에 [수정]·[삭제] 버튼을 위아래로 항상 보이게 둔다
            <li key={link.id} className="flex items-stretch gap-2">
              {/* min-w-0: 긴 제목이 버튼 칸을 밀어내지 않게 */}
              <div className="min-w-0 flex-1">
                <LinkButton link={link} />
              </div>
              <div className="flex shrink-0 flex-col justify-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(link.id)}
                  aria-label={`${link.title} 수정`} // 화면 낭독기가 어느 링크의 버튼인지 읽어 주게
                >
                  <Pencil aria-hidden />
                  수정
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setPending(link)}
                  aria-label={`${link.title} 삭제`}
                >
                  <Trash2 aria-hidden />
                  삭제
                </Button>
              </div>
            </li>
          ),
        )}
      </ul>

      {/* 삭제 확인 모달: 목록 전체가 하나를 같이 쓴다 */}
      <DeleteLinkDialog link={pending} handle={editableHandle} onClose={() => setPending(null)} />
    </>
  );
}
