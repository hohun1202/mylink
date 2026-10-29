"use client";

// 링크 추가 폼의 공통 로직(훅)입니다. react-hook-form 없이 React 기본 useState 로만 만듭니다.
// 다이얼로그 폼(AddLinkDialog)과 페이지 안 폼(AddLinkForm)이 같은 규칙으로 동작하도록 여기 한곳에 둡니다.

import { useState, type FormEvent } from "react";
import { validateLink, type LinkErrors, type LinkInput } from "@/lib/validateLink";
import { useProfileStore } from "@/store/useProfileStore";
import { saveLink } from "@/lib/linksFirestore"; // Firestore 저장 함수
import { toast } from "sonner"; // 잠깐 떴다 사라지는 알림

const EMPTY: LinkInput = { title: "", url: "" }; // 빈 입력 칸

// uid: 로그인한 사용자의 계정 번호 — 링크가 users/{uid}/links 에 저장된다
export function useLinkForm(uid: string, onAdded?: () => void) {
  const addMyLink = useProfileStore((s) => s.addMyLink); // 스토어의 링크 추가 동작
  const [form, setForm] = useState<LinkInput>(EMPTY); // 입력 중인 제목·주소
  const [errors, setErrors] = useState<LinkErrors>({}); // 칸별 오류 문구
  const [saving, setSaving] = useState(false); // Firestore 에 저장하는 중인지 (버튼 잠금용)
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
    setSaving(true);
    setSaveError(null);
    try {
      const id = await saveLink(uid, result.value); // 2. Firestore(users/{uid}/links)에 저장하고 문서 id 받기
      // 3. 같은 id 로 로컬 목록에도 추가 → 화면이 바로 다시 그려짐
      //    수정 시각은 서버 시각을 다시 읽어 오지 않고, 방금 저장한 지금 시각으로 둔다 (다음에 불러올 때 서버 값으로 바뀜)
      addMyLink({ id, ...result.value, updatedAt: Date.now() });
      toast.success("링크를 추가했어요"); // 4. 성공 알림
      reset(); // 5. 입력 칸 비우기
      onAdded?.(); // 추가 후 할 일 (예: 다이얼로그 닫기)
    } catch (err) {
      console.error("링크 저장 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
      setSaveError("링크를 저장하지 못했어요. 잠시 후 다시 시도해 주세요."); // 입력값은 그대로 둬서 다시 누를 수 있게
      toast.error("링크를 저장하지 못했어요");
    } finally {
      setSaving(false);
    }
  }

  return { form, errors, saving, saveError, update, reset, submit };
}
