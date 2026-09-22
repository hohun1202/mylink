"use client"; // 입력값·열림 상태를 다루므로 클라이언트 컴포넌트

// "링크 추가" 버튼 + 추가 폼 다이얼로그입니다. (PRD F5 · 시나리오 B-2)
// 저장을 누르면 입력값을 검사하고, 통과하면 스토어(로컬 상태)에 추가한 뒤 창을 닫습니다.
// 검사에 실패하면 저장하지 않고 입력칸 아래에 오류 문구를 보여줍니다.

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react"; // "+" 아이콘
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
import { validateLink, type LinkErrors, type LinkInput } from "@/lib/validateLink";
import { useProfileStore } from "@/store/useProfileStore";

const EMPTY: LinkInput = { title: "", url: "" }; // 빈 폼

export default function AddLinkDialog({ handle }: { handle: string }) {
  const addLink = useProfileStore((s) => s.addLink); // 스토어의 링크 추가 동작
  const [open, setOpen] = useState(false); // 다이얼로그가 열려 있는지
  const [form, setForm] = useState<LinkInput>(EMPTY); // 입력 중인 값
  const [errors, setErrors] = useState<LinkErrors>({}); // 칸별 오류 문구

  // 창이 열리거나 닫힐 때마다 폼을 비워, 다음에 열었을 때 이전 입력이 남지 않게 한다
  function handleOpenChange(next: boolean) {
    setOpen(next);
    setForm(EMPTY);
    setErrors({});
  }

  // 입력칸 하나를 바꿀 때: 값을 반영하고 그 칸의 오류 문구는 지운다
  function update(key: keyof LinkInput, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 브라우저 기본 동작(페이지 새로고침) 막기
    const result = validateLink(form);
    if (!result.ok) {
      setErrors(result.errors); // 저장하지 않고 오류만 보여줌
      return;
    }
    addLink(handle, result.value); // 로컬 상태에 추가 (LocalStorage에도 자동 저장)
    handleOpenChange(false); // 창 닫기
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* 다이얼로그를 여는 버튼 */}
      <DialogTrigger render={<Button />}>
        <Plus aria-hidden />
        링크 추가
      </DialogTrigger>

      <DialogContent>
        {/* noValidate: 브라우저 기본 검사 말풍선 대신 우리 규칙(validateLink)의 문구를 보여준다 */}
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>링크 추가</DialogTitle>
            <DialogDescription>방문자에게 보일 버튼 이름과 이동할 주소를 입력하세요.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            {/* 제목 */}
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="link-title">제목</FieldLabel>
              <Input
                id="link-title"
                autoFocus // 창이 열리면 바로 입력할 수 있게
                placeholder="예: GitHub"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                aria-invalid={!!errors.title}
              />
              <FieldError>{errors.title}</FieldError>
            </Field>

            {/* URL */}
            <Field data-invalid={!!errors.url}>
              <FieldLabel htmlFor="link-url">URL</FieldLabel>
              <Input
                id="link-url"
                inputMode="url" // 휴대폰에서 주소 입력용 키보드
                placeholder="예: https://github.com/내아이디"
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
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>취소</DialogClose>
            <Button type="submit">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
