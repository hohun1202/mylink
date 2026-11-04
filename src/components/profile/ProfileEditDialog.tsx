"use client"; // 입력값·열림 상태를 다루므로 클라이언트 컴포넌트

// 마이페이지의 [프로필 수정] 버튼 + 수정 다이얼로그입니다.
// 이름 · 소개글을 고칩니다. 저장 위치는 users/{uid}/profile/main (+ users/{uid} 동기화)
// Username(= 공개 페이지 주소)은 다른 사람과 겹치지 않게 지키기 어려워 바꿀 수 없게 했습니다. 창에서는 보여주기만 합니다.
// ⭐ 저장은 낙관적 업데이트(useUpdateProfileMutation): [저장]을 누르면 창이 바로 닫히고 마이페이지·헤더 메뉴가 새 값으로 먼저 바뀝니다.
//    실제 저장이 실패하면 화면이 예전 값으로 되돌아가고 오류 알림이 뜹니다.

import { useState, type FormEvent } from "react";
import { Check, LoaderCircle, Pencil } from "lucide-react";
import { toast } from "sonner"; // 잠깐 떴다 사라지는 알림
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdateProfileMutation } from "@/lib/queries";
import { BIO_MAX_LENGTH, DEFAULT_BIO, isBioEmpty, NAME_MAX_LENGTH } from "@/lib/usersFirestore";

type ProfileEditDialogProps = {
  uid: string; // 고칠 계정 (로그인한 사용자의 uid)
  displayName: string; // Username (= 공개 페이지 주소). 바꿀 수 없고 보여주기만 함
  name: string; // 지금 저장된 이름(실명)
  bio: string; // 지금 저장된 한 줄 소개
};

export default function ProfileEditDialog({ uid, displayName, name: savedName, bio }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false); // 다이얼로그가 열려 있는지
  const [realName, setRealName] = useState(""); // 입력 중인 이름(실명)
  const [bioValue, setBioValue] = useState(""); // 입력 중인 소개
  const updateProfile = useUpdateProfileMutation(uid); // 프로필 저장 (낙관적 업데이트)
  const saving = updateProfile.isPending; // 저장 중인지 (창은 이미 닫혀 있고, [프로필 수정] 버튼만 잠근다)

  // 다이얼로그를 열 때: 지금 저장된 값으로 입력 칸을 채운다 (소개가 기본 문구면 빈 칸)
  function handleOpenChange(next: boolean) {
    if (next) {
      setRealName(savedName);
      setBioValue(isBioEmpty(bio) ? "" : bio);
    }
    setOpen(next);
  }

  const trimmedRealName = realName.trim();
  const realNameError = trimmedRealName ? null : "이름을 입력해주세요."; // 이름은 필수 (PRD F4)
  const canSave = !saving && !realNameError;

  // [저장]
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 페이지 새로고침 막기
    if (!canSave) return;
    const nextBio = bioValue.trim() || DEFAULT_BIO; // 비워서 저장하면 기본 문구로 되돌림
    setOpen(false); // 낙관적 업데이트: 결과를 기다리지 않고 창부터 닫는다
    // 바뀐 게 하나도 없으면 저장하지 않는다
    if (trimmedRealName === savedName && nextBio === bio) return;

    // mutate: 저장을 시작만 하고 기다리지 않는다. 화면은 onMutate 에서 이미 새 값으로 바뀐다
    updateProfile.mutate(
      { name: trimmedRealName, bio: nextBio },
      {
        onSuccess: () => toast.success("프로필을 저장했어요"),
        onError: (err) => {
          // 이 시점에 화면은 이미 예전 값으로 되돌아가 있다 (useUpdateProfileMutation 의 onError)
          console.error("프로필 저장 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
          toast.error("프로필을 저장하지 못해 원래대로 되돌렸어요");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 다이얼로그를 여는 버튼 */}
      {/* 저장 중에는 잠근다 (앞의 저장이 끝나기 전에 또 고치면 되돌리기가 꼬일 수 있으므로) */}
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" disabled={saving} />}>
        <Pencil aria-hidden />
        프로필 수정
      </DialogTrigger>

      <DialogContent>
        {/* noValidate: 브라우저 기본 검사 말풍선 대신 우리 규칙의 문구를 보여준다 */}
        <form onSubmit={save} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>이름과 소개글을 고칠 수 있어요.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* Username — 바꿀 수 없음. 내 공개 주소가 무엇인지 보여주기만 한다 */}
            <Field>
              <FieldLabel htmlFor="profile-username">Username</FieldLabel>
              <Input id="profile-username" value={displayName} readOnly disabled />
              <FieldDescription>공개 페이지 주소(/{displayName})라서 바꿀 수 없어요.</FieldDescription>
            </Field>

            {/* 이름 (실명) */}
            <Field data-invalid={!!realNameError}>
              <FieldLabel htmlFor="profile-real-name">이름</FieldLabel>
              <Input
                id="profile-real-name"
                autoFocus // 창이 열리면 바로 입력할 수 있게
                autoComplete="name"
                maxLength={NAME_MAX_LENGTH} // 30자까지만 입력됨
                placeholder="예: 장호현"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                aria-invalid={!!realNameError}
                disabled={saving}
              />
              {realNameError ? (
                <FieldError>{realNameError}</FieldError>
              ) : (
                <FieldDescription>
                  {realName.length}/{NAME_MAX_LENGTH}
                </FieldDescription>
              )}
            </Field>

            {/* 소개글 */}
            <Field>
              <FieldLabel htmlFor="profile-bio">소개글</FieldLabel>
              <Input
                id="profile-bio"
                maxLength={BIO_MAX_LENGTH} // 60자까지만 입력됨
                placeholder="예: 프론트엔드를 공부하는 대학생입니다"
                value={bioValue}
                onChange={(e) => setBioValue(e.target.value)}
                disabled={saving}
              />
              {/* 지금 몇 글자인지 */}
              <FieldDescription>
                {bioValue.length}/{BIO_MAX_LENGTH}
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={saving} />}>취소</DialogClose>
            <Button type="submit" disabled={!canSave}>
              {saving ? <LoaderCircle className="animate-spin" aria-hidden /> : <Check aria-hidden />}
              {saving ? "저장 중…" : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
