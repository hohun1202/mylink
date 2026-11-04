"use client"; // 로그인 상태(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 모든 페이지 맨 위에 붙는 헤더입니다. (layout.tsx 에서 한 번만 넣음)
// - 왼쪽: mylink 로고 (누르면 첫 화면으로)
// - 오른쪽: 로그아웃 상태면 [Google로 로그인],
//           로그인 상태면 [내 페이지] 버튼(내 공개 페이지 /{displayName} 를 새 탭으로 열기) + 프로필 드롭다운 메뉴 [사진 + "○○님" ▼] (ProfileMenu)
// 로그인 상태 감지(onAuthStateChanged)도 여기서 시작합니다. 헤더는 어느 페이지에나 있으므로 한 번만 켜면 됩니다.

import NextLink from "next/link"; // 앱 안에서 페이지 이동
import { usePathname } from "next/navigation"; // 지금 보고 있는 주소
import { House } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"; // 버튼 모양(클래스)만 빌려 링크에 입힘
import { Skeleton } from "@/components/ui/skeleton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ProfileMenu from "@/components/layout/ProfileMenu"; // 로그인 후 프로필 드롭다운
import { useUser } from "@/hooks/useUser"; // 로그인 정보 + 내 공개 페이지 주소
import { useAuthListener } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function Header() {
  useAuthListener(); // 로그인 상태 감지 시작
  const { user, authReady, profileLoading, pagePath } = useUser();
  const pathname = usePathname();
  const onMyPage = pagePath !== null && pathname === pagePath; // 지금 내 공개 페이지를 보고 있는지 (aria-current 표시용)

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
          <div className="flex min-w-0 items-center gap-1">
            {/* 내 공개 페이지로 이동. 프로필을 받아 오기 전에는 주소(Username)가 확실하지 않아 자리만 잡아 둔다 */}
            {profileLoading || !pagePath ? (
              <Skeleton className="h-7 w-20 shrink-0" />
            ) : (
              <NextLink
                href={pagePath}
                aria-current={onMyPage ? "page" : undefined} // 화면 읽기 프로그램에 "지금 이 페이지"라고 알림
                // 새 탭에서 열기: 지금 보던 화면(예: 마이페이지)은 그대로 두고, 공개 페이지를 새 탭으로 띄운다
                target="_blank"
                rel="noopener noreferrer" // 새 탭이 원래 페이지를 조작하지 못하게 막는 보안 설정
                // 항상 primary(인디고 채움) 버튼 모양 — 헤더에서 가장 눈에 띄는 바로가기
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "shrink-0")}
              >
                <House aria-hidden />
                내 페이지
              </NextLink>
            )}
            <ProfileMenu user={user} />
          </div>
        )}
      </div>
    </header>
  );
}
