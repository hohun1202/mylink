"use client"; // LocalStorage(브라우저 전용)를 읽으므로 클라이언트 컴포넌트

// 공개 프로필 페이지의 실제 화면입니다. (PRD F8 · 9.1 1단계)
// 위에서부터 아바타 → 이름 → 한 줄 소개 → 링크 버튼 목록 순서로 그립니다.
// 스타일은 모두 Tailwind 클래스로만 씁니다 (CSS Module 사용 안 함 · PRD 1.4).

import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LinkButton from "@/components/LinkButton";
import { AVATARS } from "@/lib/mockData"; // avatarId → 이미지 경로
import { useProfileStore } from "@/store/useProfileStore";

export default function ProfileView({ handle }: { handle: string }) {
  const hasHydrated = useProfileStore((s) => s.hasHydrated); // LocalStorage 복원이 끝났는지
  // 주소의 핸들과 같은 프로필 찾기 (없으면 undefined)
  const profile = useProfileStore((s) => s.profiles.find((p) => p.handle === handle));

  // 화면이 브라우저에 뜬 뒤에 LocalStorage에서 데이터를 불러온다 (하이드레이션 오류 방지 · PRD 5.1)
  useEffect(() => {
    useProfileStore.persist.rehydrate();
  }, []);

  return (
    // 전체 배경. body에 남아 있는 옛 스타일 대신 shadcn 토큰 색을 쓴다
    <main className="flex min-h-screen flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      {/* 모바일 우선: 좁은 화면은 꽉 채우고, 넓은 화면에서는 가운데 최대 448px */}
      <div className="flex w-full max-w-md flex-col items-center">
        {!hasHydrated ? (
          // 복원 전에는 "없는 페이지"로 판단하지 않고 로딩만 보여준다
          <p className="mt-24 text-sm text-muted-foreground" role="status">
            불러오는 중…
          </p>
        ) : !profile ? (
          // 없는 핸들
          <p className="mt-24 text-lg font-semibold">페이지를 찾을 수 없어요</p>
        ) : (
          <>
            {/* (1) 아바타 */}
            <Avatar size="xl">
              <AvatarImage src={AVATARS[profile.avatarId] ?? AVATARS.default} alt="" />
              <AvatarFallback className="text-2xl">{profile.name.slice(0, 1)}</AvatarFallback>
            </Avatar>

            {/* (2) 이름 */}
            <h1 className="mt-4 text-center text-2xl font-bold break-words">{profile.name}</h1>

            {/* (3) 한 줄 소개 — 비어 있으면 그리지 않음 */}
            {profile.bio && (
              <p className="mt-2 text-center text-sm text-muted-foreground break-words">
                {profile.bio}
              </p>
            )}

            {/* (4) 링크 버튼 목록 — 저장된 순서대로 */}
            {profile.links.length > 0 ? (
              <ul className="mt-8 flex w-full flex-col gap-3">
                {profile.links.map((link) => (
                  <li key={link.id}>
                    <LinkButton link={link} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8 text-sm text-muted-foreground">아직 등록된 링크가 없어요</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
