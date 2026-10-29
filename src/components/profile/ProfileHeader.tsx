// 프로필 윗부분: 아바타 → 이름 → 한 줄 소개. (PRD F8 (1)~(3))
// 나중에 대시보드(F4)에서 편집 결과를 미리 보여줄 때도 같은 컴포넌트를 쓸 수 있게
// 스토어를 직접 읽지 않고 값을 props 로만 받습니다.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // shadcn 아바타
import { AVATARS } from "@/lib/mockData"; // avatarId → 이미지 경로

type ProfileHeaderProps = {
  name: string; // 표시 이름
  bio: string; // 한 줄 소개 (빈 문자열이면 그리지 않음)
  avatarId: string; // 기본 아바타 중 어떤 것인지
  avatarSrc?: string; // 직접 지정한 사진 주소 (예: 구글 프로필 사진). 있으면 avatarId 보다 우선
  nameAs?: "h1" | "h2"; // 이름 제목 단계. 페이지에 다른 h1(예: "마이페이지")이 있으면 h2 로
};

export default function ProfileHeader({ name, bio, avatarId, avatarSrc, nameAs: NameTag = "h1" }: ProfileHeaderProps) {
  return (
    <header className="flex w-full flex-col items-center text-center">
      {/* (1) 아바타 — 이미지를 못 불러오면 이름 첫 글자를 보여줌 */}
      {/* framed: 검정 굵은 테두리 + 각진 그림자 (design.md) */}
      <Avatar size="xl" variant="framed">
        {/* referrerPolicy: 구글 프로필 사진이 가끔 다른 사이트에서 막히는 것을 피함 */}
        <AvatarImage src={avatarSrc ?? AVATARS[avatarId] ?? AVATARS.default} alt="" referrerPolicy="no-referrer" />
        <AvatarFallback className="text-2xl">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>

      {/* (2) 이름 */}
      {/* 흰 글자 + 인디고 그림자: 랜딩 페이지 큰 제목(hero wordmark)과 같은 느낌 */}
      <NameTag className="mt-5 text-3xl font-black break-words text-primary-foreground text-shadow-hard">
        {name}
      </NameTag>

      {/* (3) 한 줄 소개 */}
      {/* 캔버스 배경 위라 대비가 충분한 진한 글자(foreground)를 씀 */}
      {bio && <p className="mt-2 text-sm font-bold break-words text-foreground">{bio}</p>}
    </header>
  );
}
