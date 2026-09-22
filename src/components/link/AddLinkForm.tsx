"use client"; // 입력값 상태를 다루므로 클라이언트 컴포넌트

// 페이지 안에 바로 놓는 링크 추가 폼입니다. (/mypage)
// 제목 입력 · 주소 입력 · 추가 버튼. 추가하면 목록에 바로 반영되고 입력 칸이 비워집니다.
// 빈 칸이 있으면 브라우저 알림창(alert)으로 알려 줍니다.

import { type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLinkForm } from "@/components/link/useLinkForm";

export default function AddLinkForm({ handle }: { handle: string }) {
  const { form, errors, update, submit } = useLinkForm(handle);

  // 추가 버튼을 눌렀을 때: 빈 칸이 있으면 알림창(alert)으로 알려 주고 멈춘다
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!form.title.trim()) {
      e.preventDefault(); // 페이지 새로고침 막기
      alert("제목을 입력해주세요"); // 1. 제목이 비어 있음 (공백만 있어도 빈 것으로 봄)
      return;
    }
    if (!form.url.trim()) {
      e.preventDefault();
      alert("주소를 입력해주세요"); // 2. 주소가 비어 있음
      return;
    }
    // 3. 둘 다 있으면 정상 추가 — 단, "abc" 같은 틀린 주소는 입력 칸 아래 문구로 거절 (PRD F5)
    submit(e);
  }

  return (
    // noValidate: 브라우저 기본 검사 말풍선 대신 우리 규칙의 알림·문구를 보여준다
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        {/* 1. 제목 입력 칸 */}
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="add-title">제목</FieldLabel>
          <Input
            id="add-title"
            placeholder="링크 제목 입력"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            aria-invalid={!!errors.title}
          />
          <FieldError>{errors.title}</FieldError>
        </Field>

        {/* 2. 주소 입력 칸 */}
        <Field data-invalid={!!errors.url}>
          <FieldLabel htmlFor="add-url">주소</FieldLabel>
          <Input
            id="add-url"
            inputMode="url" // 휴대폰에서 주소 입력용 키보드
            placeholder="https://..."
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            aria-invalid={!!errors.url}
          />
          <FieldError>{errors.url}</FieldError>
        </Field>

        {/* 3. 추가 버튼 — type="submit" 이라 입력 칸에서 Enter 를 눌러도 추가됨 */}
        <Button type="submit" variant="brand" size="lg">
          <Plus aria-hidden />
          추가
        </Button>
      </FieldGroup>
    </form>
  );
}
