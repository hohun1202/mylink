"use client";

// 링크 추가 폼의 공통 로직(훅)입니다. react-hook-form 없이 React 기본 useState 로만 만듭니다.
// 다이얼로그 폼(AddLinkDialog)과 페이지 안 폼(AddLinkForm)이 같은 규칙으로 동작하도록 여기 한곳에 둡니다.

import { useState, type FormEvent } from "react";
import { validateLink, type LinkErrors, type LinkInput } from "@/lib/validateLink";
import { useProfileStore } from "@/store/useProfileStore";

const EMPTY: LinkInput = { title: "", url: "" }; // 빈 입력 칸

export function useLinkForm(handle: string, onAdded?: () => void) {
  const addLink = useProfileStore((s) => s.addLink); // 스토어의 링크 추가 동작
  const [form, setForm] = useState<LinkInput>(EMPTY); // 입력 중인 제목·주소
  const [errors, setErrors] = useState<LinkErrors>({}); // 칸별 오류 문구

  // 입력 칸 하나가 바뀔 때: 값을 반영하고, 그 칸의 오류 문구는 지운다
  function update(key: keyof LinkInput, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // 입력 칸과 오류를 모두 비운다
  function reset() {
    setForm(EMPTY);
    setErrors({});
  }

  // 추가(저장) 버튼을 눌렀을 때
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 브라우저 기본 동작(페이지 새로고침) 막기
    const result = validateLink(form); // 1. 입력한 제목·주소를 가져와 검사
    if (!result.ok) {
      setErrors(result.errors); // 잘못됐으면 추가하지 않고 오류만 보여줌 (입력값은 그대로 둠)
      return;
    }
    addLink(handle, result.value); // 2. 링크 목록에 새 항목 추가 → 3. 스토어가 바뀌면 화면이 바로 다시 그려짐
    reset(); // 4. 입력 칸 비우기
    onAdded?.(); // 추가 후 할 일 (예: 다이얼로그 닫기)
  }

  return { form, errors, update, reset, submit };
}
