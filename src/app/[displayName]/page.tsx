// 공개 프로필 페이지의 "주소 담당" 파일입니다. (PRD F8)
// 폴더 이름 [displayName] 의 대괄호는 "주소의 이 자리에 아무 값이나 올 수 있다"는 뜻입니다 (동적 라우팅).
// 예: /hohun1202 로 접속하면 displayName = "hohun1202"
//
// 화면을 그리기 전에 서버에서 먼저 사용자를 찾아 봅니다.
//   - Firestore users 에서 displayName 이 같은 사용자가 있으면 → 그 프로필 + users/{uid}/links 를 화면에 넘김
//   - 없고 샘플 프로필(demo 등)도 아니면 → notFound() 로 404 페이지 (not-found.tsx)
// 서버에서 판단하므로 브라우저도 진짜 "404 Not Found" 상태 코드를 받습니다.

import { notFound } from "next/navigation"; // 부르면 이 주소를 404 페이지로 바꾼다
import ProfileView from "@/components/profile/ProfileView"; // 실제 화면을 그리는 컴포넌트
import { MOCK_PROFILES } from "@/lib/mockData"; // 샘플 프로필 (demo 등)
import { fetchPublicPage, type PublicPage } from "@/lib/publicPage"; // displayName 으로 사용자 + 링크 찾기

export default async function ProfilePage({ params }: PageProps<"/[displayName]">) {
  const { displayName: raw } = await params; // Next.js 16에서는 params가 Promise라서 await로 꺼냄
  const displayName = decodeURIComponent(raw); // 주소에 들어간 %xx 글자를 원래 글자로

  // undefined = 서버에서 확인하지 못함(권한 규칙·네트워크 오류) → 404 로 단정하지 않고 브라우저에서 다시 찾게 한다
  let page: PublicPage | null | undefined;
  try {
    page = await fetchPublicPage(displayName);
  } catch (err) {
    console.error("공개 페이지 서버 조회 실패:", err);
    page = undefined;
  }

  // 그런 사용자가 확실히 없고, 샘플 프로필도 아니면 404
  // (notFound 는 오류를 던지는 방식이라 try 블록 밖에서 불러야 한다 — 안에서 부르면 catch 가 삼켜 버림)
  const isSample = MOCK_PROFILES.some((p) => p.handle === displayName);
  if (page === null && !isSample) notFound();

  return <ProfileView handle={displayName} initialPage={page} />;
}
