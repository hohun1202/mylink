"use client"; // 열림·삭제 중 상태를 다루므로 클라이언트 컴포넌트

// 링크 삭제 확인 모달입니다. (PRD F5 · 시나리오 B-4)
// [삭제하기]를 누르면 Firestore(users/anonymous/links/<id>)에서 지운 뒤, 목록을 Firestore 에서 다시 불러옵니다(갱신형).
// 링크 하나당 모달을 만들지 않고, 목록 전체가 이 모달 하나를 같이 씁니다.

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
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
import { deleteLink } from "@/lib/linksFirestore"; // Firestore 삭제 함수
import type { Link } from "@/lib/types";
import { reloadLinks } from "@/store/useProfileStore"; // 삭제 후 목록 다시 불러오기

type DeleteLinkDialogProps = {
  link: Link | null; // 지우려는 링크 (null 이면 모달 닫힘)
  handle: string; // 링크가 속한 프로필
  onClose: () => void; // 모달을 닫을 때 (취소 · 삭제 완료)
};

export default function DeleteLinkDialog({ link, handle, onClose }: DeleteLinkDialogProps) {
  const [deleting, setDeleting] = useState(false); // Firestore 에서 지우는 중인지
  const [error, setError] = useState<string | null>(null); // 삭제 실패 문구

  // 바깥 클릭·Esc·[취소]로 닫힐 때. 지우는 중에는 닫히지 않게 막는다
  function handleOpenChange(open: boolean) {
    if (open || deleting) return;
    setError(null);
    onClose();
  }

  // [삭제하기]
  async function confirmDelete() {
    if (!link || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteLink(link.id); // 1. Firestore 문서 지우기
      await reloadLinks(handle); // 2. Firestore 에서 목록을 다시 불러와 화면 갱신
      onClose(); // 3. 모달 닫기
    } catch (err) {
      console.error("링크 삭제 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
      setError("링크를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={link !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold">정말 삭제하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            {/* 지우려는 링크 이름. 긴 이름도 넘치지 않게 줄바꿈 */}
            <span className="block font-bold break-words text-foreground">{link?.title}</span>
            {/* 경고 문구는 빨간색(destructive) */}
            <span className="mt-2 block font-bold text-destructive">이 작업은 되돌릴 수 없습니다</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Firestore 삭제에 실패했을 때 문구 */}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
          {/* AlertDialogAction 은 눌러도 저절로 닫히지 않으므로, 삭제가 끝난 뒤 직접 닫는다 */}
          <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
            {deleting ? <LoaderCircle className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
            {deleting ? "삭제 중…" : "삭제하기"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
