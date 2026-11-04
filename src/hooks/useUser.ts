"use client";

// 로그인한 사용자 정보 + Firestore 프로필(users/{uid})을 한 번에 꺼내 쓰는 커스텀 훅입니다.
// 쓰는 법: const { user, profile, authReady, profileLoading } = useUser();
// - user: Firebase Auth 의 로그인 정보 (uid·이름·이메일·사진). 로그아웃 상태면 null
// - profile: Firestore users/{uid} 문서 내용. TanStack Query 로 한 번 읽어 캐시에 둔다 (실시간 아님)
//   프로필을 고치면 낙관적 업데이트로 캐시가 먼저 바뀌므로, 이 값을 쓰는 화면(마이페이지·헤더 메뉴)이 바로 새 값으로 그려진다

import { useProfileQuery } from "@/lib/queries";
import type { UserProfile } from "@/lib/usersFirestore";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";

type UseUserResult = {
  user: AuthUser | null;
  authReady: boolean; // 로그인 여부를 Firebase 가 알려 줬는지
  profile: UserProfile | null; // users/{uid} 문서 (아직 없거나 로그아웃이면 null)
  profileLoading: boolean; // 프로필 문서를 처음 받아 오는 중인지
};

export function useUser(): UseUserResult {
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);
  const profileQuery = useProfileQuery(user?.uid); // uid 가 없으면(로그아웃) 가져오지 않음

  if (profileQuery.isError) console.error("유저 프로필 불러오기 실패:", profileQuery.error); // 권한 규칙 등. 화면은 구글 계정 정보로 대신 그림

  return {
    user,
    authReady,
    profile: profileQuery.data ?? null,
    profileLoading: !!user && profileQuery.isPending,
  };
}
