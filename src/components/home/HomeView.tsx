"use client"; // 로그인 상태(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 첫 화면(/) 본체입니다. 로그인 상태(onAuthStateChanged → useUser)에 따라 화면을 고릅니다.
// - 로그인 여부 확인 전: 자리표시
// - 로그아웃 상태: 소개 페이지(LandingPage) — 헤더에는 로그인 버튼
// - 로그인 상태: 마이페이지(MyPageContent) — 내 프로필 + 링크 목록

import LandingPage from "@/components/landing/LandingPage";
import { MyPageContent } from "@/components/mypage/MyPageView";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { useUser } from "@/hooks/useUser";

export default function HomeView() {
  const { user, authReady } = useUser();

  return (
    <main className="flex flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      {/* 모바일 우선: 좁은 화면은 꽉 채우고, 넓은 화면에서는 가운데 최대 448px */}
      <div className="flex w-full max-w-md flex-col gap-6">
        {!authReady ? <ProfileSkeleton /> : user ? <MyPageContent user={user} /> : <LandingPage />}
      </div>
    </main>
  );
}
