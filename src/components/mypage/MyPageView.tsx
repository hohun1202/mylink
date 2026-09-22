"use client"; // LocalStorage(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// /mypage 화면 본체입니다: 위에서부터 제목 → 링크 추가 폼 → 링크 목록.
// 서버가 없으므로 링크는 스토어(로컬 상태)에 추가되고, LocalStorage에도 자동 저장됩니다.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddLinkForm from "@/components/link/AddLinkForm";
import LinkList from "@/components/link/LinkList";
import ProfileNotFound from "@/components/profile/ProfileNotFound";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import { MY_HANDLE, useProfileStore, useStoreHydration } from "@/store/useProfileStore";

export default function MyPageView() {
  const hasHydrated = useStoreHydration(); // LocalStorage 복원 시작 + 끝났는지
  const profile = useProfileStore((s) => s.profiles.find((p) => p.handle === MY_HANDLE)); // 내 프로필

  return (
    <main className="flex min-h-screen flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      <div className="flex w-full max-w-md flex-col gap-6">
        {/* 상단: 제목 */}
        <h1 className="text-3xl font-black text-primary-foreground text-shadow-hard">내 링크 관리</h1>

        {!hasHydrated ? (
          <ProfileSkeleton />
        ) : !profile ? (
          <ProfileNotFound handle={MY_HANDLE} />
        ) : (
          <>
            {/* 중간: 링크 추가 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">링크 추가</CardTitle>
              </CardHeader>
              <CardContent>
                <AddLinkForm handle={MY_HANDLE} />
              </CardContent>
            </Card>

            {/* 하단: 링크 목록 — 스토어가 바뀌면 여기가 바로 다시 그려짐 */}
            <section className="flex flex-col gap-3" aria-labelledby="my-links-title">
              <h2 id="my-links-title" className="font-bold">
                내 링크 {profile.links.length}개
              </h2>
              <LinkList links={profile.links} emptyMessage="아직 링크가 없어요. 위에서 추가해 보세요" />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
