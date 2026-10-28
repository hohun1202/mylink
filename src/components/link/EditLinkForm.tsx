"use client"; // 입력값 상태를 다루므로 클라이언트 컴포넌트

// 링크 카드 자리에 그대로 펼쳐지는 인라인 수정 폼입니다. (PRD F5 · 시나리오 B-3)
// 입력 검사는 추가할 때와 같은 규칙(validateLink)을 씁니다.
// 저장하면 Firestore(users/anonymous/links/<id>)를 고친 뒤, 목록을 Firestore 에서 다시 불러옵니다(갱신형).

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateLink, type LinkErrors, type LinkInput } from "@/lib/validateLink"; // 추가와 같은 검사 규칙
import { updateLink } from "@/lib/linksFirestore"; // Firestore 수정 함수
import type { Link } from "@/lib/types";
import { reloadLinks } from "@/store/useProfileStore"; // 저장 후 목록 다시 불러오기

type EditLinkFormProps = {
  link: Link; // 고칠 링크 (처음 입력 칸에 채워 둘 값)
  handle: string; // 링크가 속한 프로필
  onDone: () => void; // 저장이 끝났거나 취소했을 때 (카드를 원래 모양으로 되돌림)
};

export default function EditLinkForm({ link, handle, onDone }: EditLinkFormProps) {
  const [form, setForm] = useState<LinkInput>({ title: link.title, url: link.url }); // 지금 값으로 시작
  const [errors, setErrors] = useState<LinkErrors>({}); // 칸별 오류 문구
  const [saving, setSaving] = useState(false); // Firestore 에 저장하는 중인지 (버튼 잠금용)
  const [saveError, setSaveError] = useState<string | null>(null); // 저장 실패 문구

  // 입력 칸 하나가 바뀔 때: 값을 반영하고, 그 칸의 오류 문구는 지운다
  function update(key: keyof LinkInput, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // 저장 버튼(또는 입력 칸에서 Enter)
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 페이지 새로고침 막기
    if (saving) return; // 두 번 저장 방지
    const result = validateLink(form); // 추가할 때와 똑같은 검사
    if (!result.ok) {
      setErrors(result.errors); // 잘못됐으면 저장하지 않고 오류만 보여줌
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await updateLink(link.id, result.value); // 1. Firestore 문서 고치기
      await reloadLinks(handle); // 2. Firestore 에서 목록을 다시 불러와 화면 갱신
      onDone(); // 3. 카드를 원래 모양으로
    } catch (err) {
      console.error("링크 수정 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
      setSaveError("링크를 수정하지 못했어요. 잠시 후 다시 시도해 주세요."); // 입력값은 그대로 둬서 다시 누를 수 있게
    } finally {
      setSaving(false);
    }
  }

  // Esc 키를 누르면 수정 취소 (저장 중에는 무시)
  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape" && !saving) onDone();
  }

  // 같은 화면에 링크가 여러 개라 입력 칸 id 가 겹치지 않도록 링크 id 를 붙인다
  const titleId = `edit-title-${link.id}`;
  const urlId = `edit-url-${link.id}`;

  return (
    // 카드 모양 테두리 안에 폼을 그린다. noValidate: 브라우저 기본 말풍선 대신 우리 문구를 보여줌
    <form onSubmit={submit} onKeyDown={handleKeyDown} noValidate className="rounded-sm border-2 border-border bg-card p-3 text-card-foreground">
      <FieldGroup className="gap-3">
        {/* 제목 */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor={titleId}>제목</FieldLabel>
          <Input
            id={titleId}
            autoFocus // 수정 버튼을 누르면 바로 입력할 수 있게
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            aria-invalid={!!errors.title}
          />
          <FieldError>{errors.title}</FieldError>
        </Field>

        {/* URL */}
        <Field data-invalid={!!errors.url}>
          <FieldLabel htmlFor={urlId}>URL</FieldLabel>
          <Input
            id={urlId}
            inputMode="url" // 휴대폰에서 주소 입력용 키보드
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            aria-invalid={!!errors.url}
          />
          {errors.url ? (
            <FieldError>{errors.url}</FieldError>
          ) : (
            <FieldDescription>https:// 를 빼고 쓰면 자동으로 붙여요.</FieldDescription>
          )}
        </Field>

        {/* Firestore 저장에 실패했을 때 문구 */}
        {saveError && <FieldError>{saveError}</FieldError>}

        {/* 취소 · 저장 버튼 */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
            <X aria-hidden />
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <LoaderCircle className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            {saving ? "저장 중…" : "저장"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
