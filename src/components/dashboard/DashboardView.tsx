"use client"; // LocalStorage(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 대시보드 화면 본체입니다. (PRD 2단계 · 시나리오 B-1, B-2, B-5)
// 지금은 "내 링크 목록 확인 + 링크 추가 + 우클릭 삭제"만 있습니다. 수정·순서 변경·프로필 편집은 다음 작업입니다.

import NextLink from "next/link"; // 앱 안에서 페이지 이동 (Link 타입과 이름이 겹치지 않게 바꿔 부름)
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"; // 버튼 모양(클래스)만 빌려 링크에 입힘
import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddLinkDialog from "@/components/link/AddLinkDialog";
import LinkList from "@/components/link/LinkList";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { MY_HANDLE, useProfileStore, useStoreHydration } from "@/store/useProfileStore";

export default function DashboardView() {
  const hasHydrated = useStoreHydration(); // LocalStorage 복원 시작 + 끝났는지
  const profile = useProfileStore((s) => s.profiles.find((p) => p.handle === MY_HANDLE)); // 내 프로필

  return (
    <main className="flex min-h-screen flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* 제목 + 내 페이지 보기 (B-5) */}
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-primary-foreground text-shadow-hard">대시보드</h1>
          <NextLink href={`/${MY_HANDLE}`} className={cn(buttonVariants({ variant: "bevel" }))}>
            <ExternalLink aria-hidden />
            내 페이지 보기
          </NextLink>
        </header>

        {!hasHydrated ? (
          <ProfileSkeleton />
        ) : !profile ? (
          // LocalStorage를 직접 고쳐 내 프로필이 사라진 경우 등
          <ProfileNotFound handle={MY_HANDLE} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">내 링크</CardTitle>
              <CardDescription>{profile.links.length}개 · 위에서부터 공개 페이지에 보이는 순서</CardDescription>
              <CardAction>
                <AddLinkDialog handle={MY_HANDLE} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <LinkList
                links={profile.links}
                emptyMessage="아직 링크가 없어요. '링크 추가'를 눌러 보세요"
                deletableHandle={MY_HANDLE} // 우클릭 삭제
              />
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
