"use client"; // 로그인 상태(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 로그인해야 쓸 수 있는 화면을 감싸는 문지기 컴포넌트입니다.
// - 로그인 여부를 아직 모르면: 자리표시(스켈레톤)
// - 로그아웃 상태면: 로그인 안내 문구 + 로그인 버튼 (LoginRequired)
// - 로그인 상태면: children 함수에 로그인 사용자를 넘겨 실제 화면을 그린다
// 쓰는 법: <RequireLogin>{(user) => <내화면 uid={user.uid} />}</RequireLogin>

import type { ReactNode } from "react";
import LoginRequired from "@/components/auth/LoginRequired";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useAuthStore, type AuthUser } from "@/store/useAuthStore";

export default function RequireLogin({ children }: { children: (user: AuthUser) => ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);

  // 로그인 여부를 확인하기 전에 "로그인하세요"를 띄우면, 로그인한 사람도 새로고침마다 안내가 잠깐 깜빡인다
  if (!authReady) return <ProfileSkeleton />;
  if (!user) return <LoginRequired />;
  return <>{children(user)}</>;
}
