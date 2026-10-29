"use client";

// 로그인한 사용자 정보 + Firestore 프로필(users/{uid})을 한 번에 꺼내 쓰는 커스텀 훅입니다.
// 쓰는 법: const { user, profile, authReady, profileLoading } = useUser();
// - user: Firebase Auth 의 로그인 정보 (uid·이름·이메일·사진). 로그아웃 상태면 null
// - profile: Firestore users/{uid} 문서 내용. 실시간(onSnapshot)이라 문서가 바뀌면 화면도 바로 바뀐다

import { useEffect, useState } from "react";
import { subscribeUserProfile, type UserProfile } from "@/lib/usersFirestore";
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
  // 어느 uid 의 프로필인지 같이 기억해, 계정이 바뀐 직후 이전 계정 프로필을 보여주지 않게 한다
  const [state, setState] = useState<{ uid: string; profile: UserProfile | null } | null>(null);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) return; // 로그아웃 상태면 지켜볼 문서가 없다
    // users/{uid} 문서 지켜보기 시작
    const unsubscribe = subscribeUserProfile(
      uid,
      (profile) => setState({ uid, profile }),
      (err) => {
        // 권한 규칙 등으로 못 읽으면 빈 프로필로 둔다 (화면은 구글 계정 정보로 대신 그림)
        console.error("유저 프로필 불러오기 실패:", err);
        setState({ uid, profile: null });
      },
    );
    return unsubscribe; // 화면을 떠나거나 계정이 바뀌면 지켜보기 멈춤
  }, [uid]);

  const loadedForThisUser = state !== null && state.uid === uid;
  return {
    user,
    authReady,
    profile: loadedForThisUser ? state.profile : null,
    profileLoading: !!uid && !loadedForThisUser,
  };
}
