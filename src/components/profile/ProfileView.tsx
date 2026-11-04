"use client"; // LocalStorage(브라우저 전용)·Firestore 를 읽으므로 클라이언트 컴포넌트

// 공개 프로필 페이지의 화면 본체입니다. (PRD F8 · 9.1 1단계)
// 스타일은 모두 Tailwind 클래스로만 씁니다 (CSS Module 사용 안 함 · PRD 1.4).
// 주소 /{handle} 의 handle 로 이렇게 찾습니다.
//   1) Firestore users 에서 displayName == handle 인 사용자 → 그 사람의 프로필 + users/{uid}/links (로그인 사용자의 공개 페이지)
//   2) 없으면 LocalStorage 의 샘플 프로필 (demo 등)
//   3) 둘 다 없으면 "페이지를 찾을 수 없어요" — 보통은 서버(page.tsx)가 먼저 404 페이지로 보내므로,
//      여기까지 오는 건 서버에서 확인을 못 했던 드문 경우뿐이다
// 공개 페이지는 누구나 볼 수 있는 보기 전용입니다. 링크 추가·수정·삭제는 로그인한 뒤 마이페이지에서 합니다.

import LinkList from "@/components/link/LinkList"; // 링크 버튼 목록
import ProfileHeader from "@/components/profile/ProfileHeader"; // 아바타·이름·소개
import ProfileNotFound from "@/components/profile/ProfileNotFound"; // 없는 핸들 안내
import ProfileSkeleton from "@/components/profile/ProfileSkeleton"; // 로딩 자리표시
import type { PublicPage } from "@/lib/publicPage";
import { usePublicPageQuery } from "@/lib/queries"; // 공개 페이지 데이터 가져오기 (TanStack Query)
import { isBioEmpty } from "@/lib/usersFirestore";
import { useProfileStore, useStoreHydration } from "@/store/useProfileStore";

type ProfileViewProps = {
  handle: string; // 주소의 displayName
  // 서버(page.tsx)가 미리 찾아 둔 결과. 객체 = 찾음, null = 그런 사용자 없음(샘플일 때), undefined = 서버에서 확인 못 함
  initialPage?: PublicPage | null;
};

export default function ProfileView({ handle, initialPage }: ProfileViewProps) {
  // LocalStorage 복원을 시작하고 끝났는지 받기 (하이드레이션 오류 방지 · PRD 5.1)
  const hasHydrated = useStoreHydration();
  // 주소의 핸들과 같은 샘플 프로필 찾기 (없으면 undefined)
  const sample = useProfileStore((s) => s.profiles.find((p) => p.handle === handle));
  // Firestore 에서 displayName 이 handle 인 사용자와 그 링크를 가져온다 (주소가 바뀌면 키가 바뀌어 새로 가져옴)
  // 서버가 넘겨준 값이 있으면 그걸로 바로 그린다 (로딩 자리표시 없이)
  const pageQuery = usePublicPageQuery(handle, initialPage);
  // 못 읽으면(권한 규칙·네트워크) 샘플 프로필로 넘어간다. 원인은 콘솔에서 확인
  if (pageQuery.isError) console.error("공개 페이지 불러오기 실패:", pageQuery.error);

  const firestoreReady = !pageQuery.isPending; // 이 주소에 대한 결과(성공이든 실패든)가 왔는지
  const found = pageQuery.data ?? null;

  return (
    // 전체 배경. body에 남아 있는 옛 스타일 대신 shadcn 토큰 색을 쓴다
    <main className="flex flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      {/* 모바일 우선: 좁은 화면은 꽉 채우고, 넓은 화면에서는 가운데 최대 448px */}
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        {!firestoreReady || !hasHydrated ? (
          // 다 찾기 전에는 "없는 페이지"로 판단하지 않고 자리표시만 보여준다
          <ProfileSkeleton />
        ) : found ? (
          // 1) 로그인 사용자의 공개 페이지
          <>
            <ProfileHeader
              name={found.profile.displayName}
              bio={isBioEmpty(found.profile.bio) ? "" : found.profile.bio} // 기본 문구("입력해주세요")는 방문자에게 숨김
              avatarId="default"
              avatarSrc={found.profile.photoURL ?? undefined}
            />
            <LinkList links={found.links} />
          </>
        ) : sample ? (
          // 2) 샘플 프로필
          <>
            <ProfileHeader name={sample.name} bio={sample.bio} avatarId={sample.avatarId} />
            <LinkList links={sample.links} />
          </>
        ) : (
          <ProfileNotFound handle={handle} />
        )}
      </div>
    </main>
  );
}
