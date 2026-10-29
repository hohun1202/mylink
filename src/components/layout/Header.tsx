"use client"; // 로그인 상태(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 모든 페이지 맨 위에 붙는 헤더입니다. (layout.tsx 에서 한 번만 넣음)
// - 왼쪽: mylink 로고 (누르면 첫 화면으로)
// - 오른쪽: 로그아웃 상태면 [Google로 로그인], 로그인 상태면 프로필 드롭다운 메뉴 [사진 + "○○님" ▼] (ProfileMenu)
// 로그인 상태 감지(onAuthStateChanged)도 여기서 시작합니다. 헤더는 어느 페이지에나 있으므로 한 번만 켜면 됩니다.

import NextLink from "next/link"; // 앱 안에서 페이지 이동
import { Skeleton } from "@/components/ui/skeleton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ProfileMenu from "@/components/layout/ProfileMenu"; // 로그인 후 프로필 드롭다운
import { useAuthListener, useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  useAuthListener(); // 로그인 상태 감지 시작
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);

  return (
    // 밝은 금속판(card) 띠 + 아래쪽 인디고 굵은 테두리 (design.md 의 bevel 느낌)
    <header className="sticky top-0 z-10 border-b-2 border-border bg-card text-card-foreground">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-4">
        {/* 로고 */}
        <NextLink href="/" className="shrink-0 text-xl font-black text-primary">
          mylink
        </NextLink>

        {!authReady ? (
          // Firebase 가 로그인 여부를 알려 주기 전에는 버튼 자리만 잡아 둔다 (로그인 버튼이 잠깐 깜빡이지 않게)
          <Skeleton className="h-7 w-28" />
        ) : !user ? (
          <GoogleLoginButton size="sm" />
        ) : (
          <ProfileMenu user={user} />
        )}
      </div>
    </header>
  );
}
