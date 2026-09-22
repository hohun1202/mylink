"use client"; // LocalStorage(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 공개 프로필 페이지의 화면 본체입니다. (PRD F8 · 9.1 1단계)
// 스토어에서 데이터를 꺼내 상태에 맞는 컴포넌트를 골라 조립하는 역할만 합니다.
// 스타일은 모두 Tailwind 클래스로만 씁니다 (CSS Module 사용 안 함 · PRD 1.4).

import AddLinkDialog from "@/components/link/AddLinkDialog"; // 링크 추가 버튼 + 다이얼로그
import LinkList from "@/components/link/LinkList"; // 링크 버튼 목록
import ProfileHeader from "@/components/profile/ProfileHeader"; // 아바타·이름·소개
import ProfileNotFound from "@/components/profile/ProfileNotFound"; // 없는 핸들 안내
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"; // 로딩 자리표시
import { MY_HANDLE, useProfileStore, useStoreHydration } from "@/store/useProfileStore";

export default function ProfileView({ handle }: { handle: string }) {
  // LocalStorage 복원을 시작하고 끝났는지 받기 (하이드레이션 오류 방지 · PRD 5.1)
  const hasHydrated = useStoreHydration();
  // 주소의 핸들과 같은 프로필 찾기 (없으면 undefined)
  const profile = useProfileStore((s) => s.profiles.find((p) => p.handle === handle));

  return (
    // 전체 배경. body에 남아 있는 옛 스타일 대신 shadcn 토큰 색을 쓴다
    <main className="flex min-h-screen flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      {/* 모바일 우선: 좁은 화면은 꽉 채우고, 넓은 화면에서는 가운데 최대 448px */}
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {!hasHydrated ? (
          // 복원 전에는 "없는 페이지"로 판단하지 않고 자리표시만 보여준다
          <ProfileSkeleton />
        ) : !profile ? (
          <ProfileNotFound handle={handle} />
        ) : (
          <>
            <ProfileHeader name={profile.name} bio={profile.bio} avatarId={profile.avatarId} />
            {/* 내 페이지일 때만 링크 추가 버튼을 보여준다 (로그인이 없어 MY_HANDLE 로 판단) */}
            {handle === MY_HANDLE && <AddLinkDialog handle={handle} label="새로운 링크 추가하기" fullWidth />}
            {/* 내 페이지면 우클릭 삭제도 켠다 */}
            <LinkList links={profile.links} deletableHandle={handle === MY_HANDLE ? handle : undefined} />
          </>
        )}
      </div>
    </main>
  );
}
