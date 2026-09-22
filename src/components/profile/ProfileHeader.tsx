// 프로필 윗부분: 아바타 → 이름 → 한 줄 소개. (PRD F8 (1)~(3))
// 나중에 대시보드(F4)에서 편집 결과를 미리 보여줄 때도 같은 컴포넌트를 쓸 수 있게
// 스토어를 직접 읽지 않고 값을 props 로만 받습니다.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // shadcn 아바타
import { AVATARS } from "@/lib/mockData"; // avatarId → 이미지 경로

type ProfileHeaderProps = {
  name: string; // 표시 이름
  bio: string; // 한 줄 소개 (빈 문자열이면 그리지 않음)
  avatarId: string; // 기본 아바타 중 어떤 것인지
};

export default function ProfileHeader({ name, bio, avatarId }: ProfileHeaderProps) {
  return (
    <header className="flex w-full flex-col items-center text-center">
      {/* (1) 아바타 — 이미지를 못 불러오면 이름 첫 글자를 보여줌 */}
      <Avatar size="xl">
        <AvatarImage src={AVATARS[avatarId] ?? AVATARS.default} alt="" />
        <AvatarFallback className="text-2xl">{name.slice(0, 1)}</AvatarFallback>
      </Avatar>

      {/* (2) 이름 */}
      <h1 className="mt-4 text-2xl font-bold break-words">{name}</h1>

      {/* (3) 한 줄 소개 */}
      {bio && <p className="mt-2 text-sm text-muted-foreground break-words">{bio}</p>}
    </header>
  );
}
