"use client"; // 입력값·수정 중 상태를 다루므로 클라이언트 컴포넌트

// 마이페이지의 한 줄 소개 + [수정] 버튼입니다.
// [수정]을 누르면 그 자리에 입력 칸이 펼쳐지고, 저장하면 Firestore users/{uid} 문서의 bio 가 바뀝니다.
// 마이페이지·프로필 메뉴는 이 문서를 실시간(onSnapshot)으로 보고 있으므로 저장 즉시 새 소개로 바뀝니다.

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, LoaderCircle, Pencil, X } from "lucide-react";
import { toast } from "sonner"; // 잠깐 떴다 사라지는 알림
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BIO_MAX_LENGTH, DEFAULT_BIO, isBioEmpty, updateBio } from "@/lib/usersFirestore";

type BioEditorProps = {
  uid: string; // 소개를 고칠 계정 (로그인한 사용자의 uid)
  bio: string; // 지금 저장된 소개
};

export default function BioEditor({ uid, bio }: BioEditorProps) {
  const [editing, setEditing] = useState(false); // 입력 칸이 펼쳐져 있는지
  const [value, setValue] = useState(""); // 입력 중인 소개
  const [saving, setSaving] = useState(false); // Firestore 에 저장하는 중인지
  const empty = isBioEmpty(bio); // 아직 소개를 안 썼는지 (기본 문구 그대로)

  // [수정] 누르면: 지금 소개로 입력 칸을 채운다 (기본 문구면 빈 칸으로 시작)
  function startEdit() {
    setValue(empty ? "" : bio);
    setEditing(true);
  }

  // [저장] (또는 Enter)
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 페이지 새로고침 막기
    if (saving) return; // 두 번 저장 방지
    const next = value.trim(); // 앞뒤 공백 제거
    if (next === bio) {
      setEditing(false); // 바뀐 게 없으면 저장하지 않고 닫기
      return;
    }
    setSaving(true);
    try {
      // 비워서 저장하면 기본 문구로 되돌린다 (방문자에게는 기본 문구가 보이지 않음)
      await updateBio(uid, next || DEFAULT_BIO);
      toast.success("한 줄 소개를 저장했어요");
      setEditing(false);
    } catch (err) {
      console.error("소개 저장 실패:", err); // 원인(권한 규칙, 네트워크 등)은 개발자 도구 콘솔에서 확인
      toast.error("소개를 저장하지 못했어요"); // 입력값은 그대로 둬서 다시 누를 수 있게
    } finally {
      setSaving(false);
    }
  }

  // Esc 키를 누르면 수정 취소 (저장 중에는 무시)
  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape" && !saving) setEditing(false);
  }

  if (!editing) {
    return (
      <div className="flex max-w-full items-center justify-center gap-2">
        {/* 아직 안 썼으면 기본 문구를 흐리게(안내처럼) 보여준다 */}
        <p className={empty ? "text-sm break-words text-foreground/70 italic" : "text-sm font-bold break-words text-foreground"}>
          {empty ? DEFAULT_BIO : bio}
        </p>
        <Button type="button" variant="bevel" size="xs" onClick={startEdit} className="shrink-0" aria-label="한 줄 소개 수정">
          <Pencil aria-hidden />
          수정
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={save} onKeyDown={handleKeyDown} className="flex w-full flex-col gap-2">
      <label htmlFor="bio-input" className="sr-only">
        한 줄 소개
      </label>
      <Input
        id="bio-input"
        autoFocus // 수정을 누르면 바로 입력할 수 있게
        value={value}
        maxLength={BIO_MAX_LENGTH} // 60자까지만 입력됨
        placeholder="예: 프론트엔드를 공부하는 대학생입니다"
        onChange={(e) => setValue(e.target.value)}
        disabled={saving}
      />
      <div className="flex items-center justify-between gap-2">
        {/* 지금 몇 글자인지 */}
        <span className="text-xs font-bold text-foreground">
          {value.length}/{BIO_MAX_LENGTH}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
            <X aria-hidden />
            취소
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? <LoaderCircle className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            {saving ? "저장 중…" : "저장"}
          </Button>
        </div>
      </div>
    </form>
  );
}
