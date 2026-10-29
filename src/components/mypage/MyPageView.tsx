"use client"; // 로그인 상태·Firestore 를 읽으므로 클라이언트 컴포넌트

// 마이페이지 화면입니다: 위에서부터 제목 → 내 프로필 → 링크 추가 폼 → 링크 목록.
// - 프로필: Firestore users/{uid} 문서를 실시간(onSnapshot)으로 읽어 보여준다 (useUser)
// - 링크: Firestore users/{uid}/links 에서 불러오고, 추가·수정·삭제도 같은 경로에 한다
// 첫 화면(/)은 로그인하면 이 화면(MyPageContent)을, /mypage 는 MyPageView 를 보여준다.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddLinkForm from "@/components/link/AddLinkForm";
import LinkList from "@/components/link/LinkList";
import BioEditor from "@/components/profile/BioEditor"; // 한 줄 소개 + [수정]
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSkeleton from "@/components/profile/ProfileSkeleton";
import RequireLogin from "@/components/auth/RequireLogin"; // 로그아웃 상태면 로그인 안내를 대신 보여줌
import { useUser } from "@/hooks/useUser";
import type { AuthUser } from "@/store/useAuthStore";
import { useMyLinks, useProfileStore } from "@/store/useProfileStore";

// /mypage 주소용: 로그인하지 않았으면 로그인 안내 문구를 보여준다
export default function MyPageView() {
  return (
    <main className="flex flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      <div className="flex w-full max-w-md flex-col gap-6">
        <RequireLogin>{(user) => <MyPageContent user={user} />}</RequireLogin>
      </div>
    </main>
  );
}

// 로그인한 뒤의 마이페이지 본문 (user 가 반드시 있음)
export function MyPageContent({ user }: { user: AuthUser }) {
  const { profile, profileLoading } = useUser(); // users/{uid} 문서 (실시간)
  const linksLoading = useMyLinks(user.uid); // Firestore 에서 내 링크를 최신순으로 불러오기
  const links = useProfileStore((s) => s.myLinks); // 내 링크

  return (
    <>
      {/* 상단: 제목 */}
      <h1 className="text-3xl font-black text-primary-foreground text-shadow-hard">마이페이지</h1>

      {/* 내 프로필: Firestore 문서가 아직 없으면(첫 로그인 직후 만드는 중) 구글 계정 정보로 대신 보여준다 */}
      {profileLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <ProfileHeader
            nameAs="h2"
            name={profile?.displayName || user.name} // displayName = 이메일 앞부분
            bio="" // 소개는 아래 BioEditor 가 [수정] 버튼과 함께 그린다
            avatarId="default"
            avatarSrc={profile?.photoURL ?? user.photoURL ?? undefined}
          />
          <BioEditor uid={user.uid} bio={profile?.bio ?? ""} />
          {/* 내 데이터가 어디에 저장되는지 (로그인 계정마다 uid 가 달라 데이터가 나뉜다는 것을 확인용으로 보여줌) */}
          <p className="max-w-full font-mono text-xs break-all text-foreground">저장 위치: users/{user.uid}/links</p>
        </div>
      )}

      {/* 링크 추가 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">링크 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <AddLinkForm uid={user.uid} />
        </CardContent>
      </Card>

      {/* 링크 목록 — 스토어가 바뀌면 여기가 바로 다시 그려짐 */}
      <section className="flex flex-col gap-3" aria-labelledby="my-links-title">
        <h2 id="my-links-title" className="font-bold">
          내 링크 {links.length}개
        </h2>
        <LinkList
          links={links}
          loading={linksLoading} // Firestore 에서 불러오는 중이면 로딩 표시
          emptyMessage="아직 링크가 없어요. 위에서 추가해 보세요"
          ownerUid={user.uid} // 수정·삭제 버튼
        />
      </section>
    </>
  );
}
