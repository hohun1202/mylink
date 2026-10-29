"use client"; // 로그인 상태·Firestore 를 읽으므로 클라이언트 컴포넌트

// 대시보드 화면 본체입니다. (PRD 2단계 · 시나리오 B-1, B-2, B-5)
// 지금은 "내 링크 목록 확인 + 링크 추가 + 수정·삭제"만 있습니다. 순서 변경·프로필 편집은 다음 작업입니다.
// 로그인해야 쓸 수 있고, 링크는 Firestore(users/{uid}/links)에 저장됩니다.

import NextLink from "next/link"; // 앱 안에서 페이지 이동 (Link 타입과 이름이 겹치지 않게 바꿔 부름)
import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"; // 버튼 모양(클래스)만 빌려 링크에 입힘
import { cn } from "@/lib/utils";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddLinkDialog from "@/components/link/AddLinkDialog";
import LinkList from "@/components/link/LinkList";
import RequireLogin from "@/components/auth/RequireLogin"; // 로그아웃 상태면 로그인 안내를 대신 보여줌
import { useMyLinks, useProfileStore } from "@/store/useProfileStore";

export default function DashboardView() {
  return (
    <main className="flex flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* 제목 + 내 페이지 보기 (B-5) */}
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-primary-foreground text-shadow-hard">대시보드</h1>
          {/* 로그인한 내 링크는 첫 화면(/)에 보인다 */}
          <NextLink href="/" className={cn(buttonVariants({ variant: "bevel" }))}>
            <ExternalLink aria-hidden />
            내 페이지 보기
          </NextLink>
        </header>

        <RequireLogin>{(user) => <DashboardBody uid={user.uid} />}</RequireLogin>
      </div>
    </main>
  );
}

// 로그인한 뒤의 화면
function DashboardBody({ uid }: { uid: string }) {
  const linksLoading = useMyLinks(uid); // Firestore 에서 내 링크를 최신순으로 불러오기
  const links = useProfileStore((s) => s.myLinks); // 내 링크

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-bold">내 링크</CardTitle>
        <CardDescription>{links.length}개 · 위에서부터 공개 페이지에 보이는 순서</CardDescription>
        <CardAction>
          <AddLinkDialog uid={uid} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <LinkList
          links={links}
          loading={linksLoading} // Firestore 에서 불러오는 중이면 로딩 표시
          emptyMessage="아직 링크가 없어요. '링크 추가'를 눌러 보세요"
          ownerUid={uid} // 수정·삭제 버튼
        />
      </CardContent>
    </Card>
  );
}
