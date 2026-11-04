"use client"; // 로그인 상태(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 모든 페이지 맨 위에 붙는 헤더입니다. (layout.tsx 에서 한 번만 넣음)
// - 왼쪽: mylink 로고 (누르면 루트 페이지 / 로)
// - 오른쪽: 로그아웃 상태면 [Google로 로그인],
//           로그인 상태면 [내 페이지] 버튼(내 공개 페이지 /{displayName} 를 새 탭으로 열기) + 프로필 드롭다운 메뉴 [사진 + "○○님" ▼] (ProfileMenu)
// - 아래 줄: 로그인 상태면 페이지 이동 메뉴 [마이페이지] [통계] — 지금 있는 페이지는 밝은 탭으로 표시
// 로그인 상태 감지(onAuthStateChanged)도 여기서 시작합니다. 헤더는 어느 페이지에나 있으므로 한 번만 켜면 됩니다.

import NextLink from "next/link"; // 앱 안에서 페이지 이동
import { usePathname } from "next/navigation"; // 지금 보고 있는 주소
import { ChartColumn, House, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"; // 버튼 모양(클래스)만 빌려 링크에 입힘
import { Skeleton } from "@/components/ui/skeleton";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import ProfileMenu from "@/components/layout/ProfileMenu"; // 로그인 후 프로필 드롭다운
import { useUser } from "@/hooks/useUser"; // 로그인 정보 + 내 공개 페이지 주소
import { useAuthListener } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

// 헤더 아래 이동 메뉴에 놓을 페이지들 (주소 · 이름 · 아이콘)
const NAV_ITEMS = [
  { href: "/", label: "마이페이지", icon: User }, // 로그인하면 / 가 곧 마이페이지
  { href: "/stats", label: "통계", icon: ChartColumn },
] as const;

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
        {/* 로고 = 루트 페이지(/)로 가는 링크. 올리면 살짝 밑줄로 "누를 수 있음"을 보여 준다 */}
        <NextLink
          href="/"
          aria-label="mylink 첫 화면으로" // 화면 낭독기가 "어디로 가는 링크인지" 읽어 주게
          className="shrink-0 text-xl font-black text-primary underline-offset-4 hover:underline"
        >
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

      {/* 페이지 이동 메뉴 줄 (로그인했을 때만). 인디고 띠 위에 탭을 나란히 둔다 */}
      {authReady && user && (
        <nav aria-label="페이지 이동" className="bg-border">
          <ul className="mx-auto flex w-full max-w-md gap-1 px-4 py-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href; // 지금 이 페이지에 있는지
              return (
                <li key={href}>
                  <NextLink
                    href={href}
                    aria-current={active ? "page" : undefined} // 화면 낭독기에 "현재 페이지" 라고 알림
                    className={cn(
                      // nav-label: 11px 굵은 대문자 라벨 (design.md 의 메뉴 글씨) · 살짝 둥근 칩 모양
                      "nav-label flex items-center gap-1 rounded-sm px-3 py-1",
                      active
                        ? "bg-card text-foreground" // 지금 페이지: 밝은 금속판 칩으로 튀어 보이게
                        : "text-white hover:bg-white/15", // 다른 페이지: 흰 글자, 올리면 살짝 밝게
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" />
                    {label}
                  </NextLink>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
