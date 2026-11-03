"use client"; // 입력값·열림 상태·중복 확인 결과를 다루므로 클라이언트 컴포넌트

// 마이페이지의 [프로필 수정] 버튼 + 수정 다이얼로그입니다.
// 표시 이름(displayName)과 한 줄 소개(bio)를 한 번에 고칩니다.
//
// 표시 이름은 내 공개 페이지 주소(/{displayName})이기도 해서, 입력하는 동안 아래 순서로 검사합니다.
//   1) 형식 검사 (글자 수·허용 글자·예약어) — 바로
//   2) 중복 확인 (Firestore 에서 같은 이름을 쓰는 다른 사람이 있는지) — 타자를 멈추고 0.4초 뒤
// 저장을 누르면 updateProfile 이 중복을 한 번 더 확인한 뒤 users/{uid} 문서를 바꿉니다.

import { useEffect, useState, type FormEvent } from "react";
import { Check, CircleAlert, LoaderCircle, Pencil } from "lucide-react";
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
import {
  BIO_MAX_LENGTH,
  DEFAULT_BIO,
  DISPLAY_NAME_MAX_LENGTH,
  DisplayNameTakenError,
  isBioEmpty,
  isDisplayNameTaken,
  updateProfile,
  validateDisplayName,
} from "@/lib/usersFirestore";

type ProfileEditDialogProps = {
  uid: string; // 고칠 계정 (로그인한 사용자의 uid)
  displayName: string; // 지금 저장된 표시 이름
  bio: string; // 지금 저장된 한 줄 소개
};

// 중복 확인 상태: 안 함(이름 그대로) / 확인 중 / 사용 가능 / 이미 사용 중 / 확인 실패(네트워크 등)
type NameCheck = "idle" | "checking" | "available" | "taken" | "error";

// 타자를 멈춘 뒤 몇 밀리초 기다렸다가 중복 확인할지 (한 글자마다 Firestore 를 부르지 않도록)
const CHECK_DELAY_MS = 400;

export default function ProfileEditDialog({ uid, displayName, bio }: ProfileEditDialogProps) {
  const [open, setOpen] = useState(false); // 다이얼로그가 열려 있는지
  const [name, setName] = useState(""); // 입력 중인 표시 이름
  const [bioValue, setBioValue] = useState(""); // 입력 중인 소개
  const [check, setCheck] = useState<{ name: string; result: NameCheck }>({ name: "", result: "idle" }); // 어느 이름을 확인한 결과인지 같이 기억
  const [saving, setSaving] = useState(false); // Firestore 에 저장하는 중인지

  const trimmedName = name.trim(); // 앞뒤 공백은 빼고 검사·저장
  const nameChanged = trimmedName !== displayName; // 이름을 바꿨는지 (안 바꿨으면 검사할 필요 없음)
  const formatError = nameChanged ? validateDisplayName(trimmedName) : null; // 형식 오류 문구 (없으면 null)
  // 지금 입력값에 대한 중복 확인 결과. 입력이 바뀌었는데 아직 확인 전이면 "확인 중"으로 본다
  const nameCheck: NameCheck = !nameChanged || formatError ? "idle" : check.name === trimmedName ? check.result : "checking";

  // 이름 입력이 바뀔 때마다: 형식이 맞으면 0.4초 기다렸다가 Firestore 에서 중복 확인
  useEffect(() => {
    if (!open || !nameChanged || formatError) return; // 검사할 필요 없음
    let cancelled = false; // 기다리는 사이 또 입력하면 이전 확인 결과는 버린다
    const timer = setTimeout(() => {
      isDisplayNameTaken(trimmedName, uid)
        .then((taken) => {
          if (!cancelled) setCheck({ name: trimmedName, result: taken ? "taken" : "available" });
        })
        .catch((err) => {
          console.error("이름 중복 확인 실패:", err); // 원인(권한 규칙, 네트워크 등)은 콘솔에서 확인
          if (!cancelled) setCheck({ name: trimmedName, result: "error" });
        });
    }, CHECK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer); // 0.4초가 지나기 전에 또 입력하면 예약해 둔 확인을 취소
    };
  }, [open, nameChanged, formatError, trimmedName, uid]);

  // 다이얼로그를 열 때: 지금 저장된 값으로 입력 칸을 채운다 (소개가 기본 문구면 빈 칸)
  // 저장 중에는 바깥 클릭·Esc 로 닫히지 않게 막는다
  function handleOpenChange(next: boolean) {
    if (!next && saving) return;
    if (next) {
      setName(displayName);
      setBioValue(isBioEmpty(bio) ? "" : bio);
      setCheck({ name: "", result: "idle" });
    }
    setOpen(next);
  }

  // 저장 버튼을 누를 수 있는지: 이름이 형식에 맞고, 바꿨다면 "사용 가능"으로 확인이 끝났어야 한다
  const canSave = !saving && !formatError && (!nameChanged || nameCheck === "available");

  // [저장]
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 페이지 새로고침 막기
    if (!canSave) return;
    const nextBio = bioValue.trim() || DEFAULT_BIO; // 비워서 저장하면 기본 문구로 되돌림
    // 바뀐 것만 담는다
    const changes: { displayName?: string; bio?: string } = {};
    if (nameChanged) changes.displayName = trimmedName;
    if (nextBio !== bio) changes.bio = nextBio;
    if (Object.keys(changes).length === 0) {
      setOpen(false); // 바뀐 게 없으면 저장하지 않고 닫기
      return;
    }
    setSaving(true);
    try {
      await updateProfile(uid, changes); // 이름이 바뀌었으면 여기서 중복을 한 번 더 확인
      toast.success("프로필을 저장했어요");
      setOpen(false);
    } catch (err) {
      if (err instanceof DisplayNameTakenError) {
        // 확인한 뒤 저장하기 전 사이에 다른 사람이 먼저 가져간 경우
        setCheck({ name: trimmedName, result: "taken" });
      } else {
        console.error("프로필 저장 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
        toast.error("프로필을 저장하지 못했어요"); // 입력값은 그대로 둬서 다시 누를 수 있게
      }
    } finally {
      setSaving(false);
    }
  }

  // 이름 칸 아래에 보여줄 문구: 오류면 빨간 글씨, 아니면 안내 글씨
  const nameError =
    formatError ??
    (nameCheck === "taken" ? "이미 다른 사람이 쓰고 있는 이름이에요." : nameCheck === "error" ? "중복 확인에 실패했어요. 잠시 후 다시 입력해 보세요." : null);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 다이얼로그를 여는 버튼 */}
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <Pencil aria-hidden />
        프로필 수정
      </DialogTrigger>

      <DialogContent>
        {/* noValidate: 브라우저 기본 검사 말풍선 대신 우리 규칙의 문구를 보여준다 */}
        <form onSubmit={save} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
            <DialogDescription>표시 이름은 내 공개 페이지 주소로도 쓰여요.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* 표시 이름 */}
            <Field data-invalid={!!nameError}>
              <FieldLabel htmlFor="profile-name">표시 이름</FieldLabel>
              <Input
                id="profile-name"
                autoFocus // 창이 열리면 바로 입력할 수 있게
                autoComplete="off"
                autoCapitalize="none" // 휴대폰에서 첫 글자가 대문자로 바뀌지 않게
                spellCheck={false}
                maxLength={DISPLAY_NAME_MAX_LENGTH}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!nameError}
                disabled={saving}
              />
              {nameError ? (
                <FieldError>{nameError}</FieldError>
              ) : (
                <FieldDescription className="flex items-center gap-1">
                  {/* 중복 확인 상태 표시 */}
                  {nameCheck === "checking" && <LoaderCircle className="size-3.5 animate-spin" aria-hidden />}
                  {nameCheck === "available" && <Check className="size-3.5 text-green-600" aria-hidden />}
                  {nameCheck === "idle" && <CircleAlert className="size-3.5" aria-hidden />}
                  <span aria-live="polite">
                    {nameCheck === "checking"
                      ? "중복 확인 중…"
                      : nameCheck === "available"
                        ? `사용할 수 있어요 · 새 주소: /${trimmedName}`
                        : "영문 소문자·숫자·밑줄(_), 3~20자"}
                  </span>
                </FieldDescription>
              )}
            </Field>

            {/* 한 줄 소개 */}
            <Field>
              <FieldLabel htmlFor="profile-bio">한 줄 소개</FieldLabel>
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

          {/* 이름을 바꾸면 예전 주소로는 공개 페이지가 안 열린다는 것을 미리 알려준다 */}
          {nameChanged && nameCheck === "available" && (
            <p className="text-xs text-foreground/70">이름을 바꾸면 예전 주소(/{displayName})는 더 이상 열리지 않아요.</p>
          )}

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
