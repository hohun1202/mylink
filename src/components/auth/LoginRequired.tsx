"use client"; // 로그인 버튼(클릭)을 담으므로 클라이언트 컴포넌트

// 로그인하지 않은 사람이 내 페이지·대시보드를 열었을 때 보여주는 안내입니다.
// 무엇을 할 수 있는지 설명하고, 그 자리에서 바로 로그인할 수 있게 버튼을 둡니다.

import { LockKeyhole } from "lucide-react"; // 자물쇠 아이콘
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function LoginRequired() {
  return (
    // 밝은 판(card) 위에 문구를 올려 canvas 바탕에서도 잘 읽히게 한다
    <Empty className="flex-none rounded-sm border-2 border-border bg-card text-card-foreground shadow-hard">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LockKeyhole />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-bold">로그인이 필요해요</EmptyTitle>
        <EmptyDescription className="text-card-foreground">
          Google 계정으로 로그인하면 나만의 링크를 추가·수정·삭제할 수 있어요.
          <br />
          링크는 내 계정에만 따로 저장되어 다른 사람의 링크와 섞이지 않아요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* 로그인에 실패하면(팝업 차단 등) 토스트로 알려 준다 */}
        <GoogleLoginButton size="lg" className="h-12 w-full text-base" />
      </EmptyContent>
    </Empty>
  );
}
