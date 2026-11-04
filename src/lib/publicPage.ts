// 공개 페이지(/{displayName}) 하나를 그리는 데 필요한 데이터를 한 번에 가져오는 함수입니다.
// 서버(주소 담당 page.tsx — 없는 사용자면 404)와 브라우저(TanStack Query) 양쪽에서 같은 함수를 씁니다.
// 그래서 "use client" 를 붙이지 않은 평범한 파일에 둡니다.
//
//   1) users 컬렉션에서 displayName == 주소의 이름 인 사용자를 찾는다   → 사용자 uid + 프로필
//   2) 그 사람의 링크 users/{uid}/links 를 가져온다                    → 링크 목록 (최신순)

import { fetchLinks } from "@/lib/linksFirestore";
import { findUserByDisplayName, type UserProfile } from "@/lib/usersFirestore";
import type { Link } from "@/lib/types";

// 공개 페이지 데이터 모양. 서버 → 브라우저로 넘겨야 하므로 숫자·문자열만 들어 있다 (Firestore 시각은 이미 밀리초 숫자)
export type PublicPage = {
  uid: string; // 이 페이지 주인의 계정 번호 (링크 경로 users/{uid}/links 의 키)
  profile: UserProfile; // users/{uid} 문서 내용
  links: Link[]; // users/{uid}/links 의 링크들
};

// displayName 으로 사용자를 찾아 프로필 + 링크를 돌려준다. 그런 사용자가 없으면 null
export async function fetchPublicPage(displayName: string): Promise<PublicPage | null> {
  const user = await findUserByDisplayName(displayName);
  if (!user) return null;
  return { uid: user.uid, profile: user.profile, links: await fetchLinks(user.uid) };
}
