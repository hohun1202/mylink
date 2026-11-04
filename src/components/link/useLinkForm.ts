"use client";

// 링크 추가 폼의 공통 로직(훅)입니다. react-hook-form 없이 React 기본 useState 로만 만듭니다.
// 다이얼로그 폼(AddLinkDialog)과 페이지 안 폼(AddLinkForm)이 같은 규칙으로 동작하도록 여기 한곳에 둡니다.
// 저장은 TanStack Query 의 useMutation(useAddLinkMutation)이 맡습니다. 저장 중 여부(isPending)도 거기서 받습니다.

import { useState, type FormEvent } from "react";
import { validateLink, type LinkErrors, type LinkInput } from "@/lib/validateLink";
import { useAddLinkMutation } from "@/lib/queries"; // 저장 + 저장 후 목록 다시 가져오기
import { toast } from "sonner"; // 잠깐 떴다 사라지는 알림

const EMPTY: LinkInput = { title: "", url: "" }; // 빈 입력 칸

// uid: 로그인한 사용자의 계정 번호 — 링크가 users/{uid}/links 에 저장된다
export function useLinkForm(uid: string, onAdded?: () => void) {
  const addLink = useAddLinkMutation(uid); // 링크 추가 작업 (저장 중 여부: addLink.isPending)
  const [form, setForm] = useState<LinkInput>(EMPTY); // 입력 중인 제목·주소
  const [errors, setErrors] = useState<LinkErrors>({}); // 칸별 오류 문구
  const saving = addLink.isPending; // Firestore 에 저장하고 목록을 다시 가져오는 중인지 (버튼 잠금용)
  const [saveError, setSaveError] = useState<string | null>(null); // 저장 실패 문구

  // 입력 칸 하나가 바뀔 때: 값을 반영하고, 그 칸의 오류 문구는 지운다
  function update(key: keyof LinkInput, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // 입력 칸과 오류를 모두 비운다
  function reset() {
    setForm(EMPTY);
    setErrors({});
    setSaveError(null);
  }

  // 추가(저장) 버튼을 눌렀을 때
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 브라우저 기본 동작(페이지 새로고침) 막기
    if (saving) return; // 저장 중에 또 누르면 두 번 저장되지 않게 무시
    const result = validateLink(form); // 1. 입력한 제목·주소를 가져와 검사
    if (!result.ok) {
      setErrors(result.errors); // 잘못됐으면 추가하지 않고 오류만 보여줌 (입력값은 그대로 둠)
      return;
    }
    setSaveError(null);
    try {
      // 2. Firestore(users/{uid}/links)에 저장 → 3. 끝나면 내 링크 목록을 다시 가져와 화면 갱신 (mutateAsync 는 둘 다 끝날 때까지 기다림)
      await addLink.mutateAsync(result.value);
      toast.success("링크를 추가했어요"); // 4. 성공 알림
      reset(); // 5. 입력 칸 비우기
      onAdded?.(); // 추가 후 할 일 (예: 다이얼로그 닫기)
    } catch (err) {
      console.error("링크 저장 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
      setSaveError("링크를 저장하지 못했어요. 잠시 후 다시 시도해 주세요."); // 입력값은 그대로 둬서 다시 누를 수 있게
      toast.error("링크를 저장하지 못했어요");
    }
  }

  return { form, errors, saving, saveError, update, reset, submit };
}
