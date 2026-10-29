"use client"; // 열림 상태·로그인 정보를 다루므로 클라이언트 컴포넌트

// 헤더 오른쪽의 프로필 드롭다운 메뉴입니다. (Base UI Menu 기반 ui/dropdown-menu)
// 사진 + 이름을 누르면 아래 내용이 펼쳐집니다.
//   ┌ [사진] displayName / username / email
//   ├ 한 줄 소개 · 내 링크 N개
//   ├ 마이페이지 · 링크 추가
//   ├ 내 페이지 미리보기 · 내 페이지 링크 복사
//   └ Google 계정으로 로그인됨 · 로그아웃

import { useState } from "react";
import { useRouter } from "next/navigation"; // 코드로 페이지 이동
import { ChevronDown, Copy, ExternalLink, LogOut, Plus, User } from "lucide-react";
import { toast } from "sonner"; // 잠깐 떴다 사라지는 알림
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddLinkDialog from "@/components/link/AddLinkDialog";
import { useUser } from "@/hooks/useUser";
import { isBioEmpty, publicPagePath } from "@/lib/usersFirestore";
import { signOutUser, type AuthUser } from "@/store/useAuthStore";
import { useMyLinks, useProfileStore } from "@/store/useProfileStore";

export default function ProfileMenu({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { profile } = useUser(); // Firestore users/{uid} 문서 (실시간)
  const [addOpen, setAddOpen] = useState(false); // "링크 추가" 창이 열려 있는지

  // 화면에 쓸 값: Firestore 문서가 있으면 그 값, 아직 없으면 로그인 정보로 대신한다
  const displayName = profile?.displayName || user.name; // 이메일 앞부분
  const username = profile?.username ?? user.username; // 구글 실명
  const photoURL = profile?.photoURL ?? user.photoURL;
  const pagePath = publicPagePath(displayName); // 내 공개 페이지 주소 (/hohun1202)

  // 내 페이지 주소 전체(https://…/hohun1202)를 클립보드에 복사
  async function copyPageUrl() {
    const url = `${window.location.origin}${pagePath}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("내 페이지 주소를 복사했어요", { description: url }); // 복사한 주소도 같이 보여준다
    } catch (err) {
      console.error("주소 복사 실패:", err); // http 주소 등 클립보드를 못 쓰는 환경
      toast.error("주소를 복사하지 못했어요");
    }
  }

  // 로그아웃한 뒤 첫 화면(/)으로 돌아가 랜딩 페이지를 보여준다
  async function handleSignOut() {
    await signOutUser();
    router.push("/");
  }

  return (
    <>
      <DropdownMenu>
        {/* 메뉴를 여는 버튼: 사진 + "○○님" + ▼ */}
        <DropdownMenuTrigger className="flex min-w-0 items-center gap-2 rounded-sm px-1.5 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted">
          <ProfileAvatar name={displayName} photoURL={photoURL} />
          {/* 긴 이름은 말줄임표(…)로 자른다 */}
          <span className="truncate text-sm font-bold">{displayName}님</span>
          <ChevronDown aria-hidden className="size-4 shrink-0" />
        </DropdownMenuTrigger>

        {/* w-72: 기본값(여는 버튼 너비)은 너무 좁아서 넓힌다. align="end": 오른쪽 끝에 맞춰 펼침 */}
        <DropdownMenuContent align="end" className="w-72">
          {/* 계정 정보 (누르는 메뉴가 아니라 보여주기만 하는 칸) */}
          <div className="flex items-center gap-3 px-2 py-2">
            <ProfileAvatar name={displayName} photoURL={photoURL} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-bold">{displayName}</p>
              {username && <p className="truncate text-sm">{username}</p>}
              {user.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* 한 줄 소개 · 링크 수 */}
          <div className="flex flex-col gap-1 px-2 py-1.5 text-sm">
            {isBioEmpty(profile?.bio) ? (
              <p className="text-muted-foreground italic">한 줄 소개를 아직 안 썼어요 · 마이페이지에서 수정</p>
            ) : (
              <p className="break-words">{profile?.bio}</p>
            )}
            <MyLinkCount uid={user.uid} />
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/")}>
              <User aria-hidden />
              마이페이지
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAddOpen(true)}>
              <Plus aria-hidden />
              링크 추가
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* 방문자가 보는 내 공개 페이지를 새 탭에서 연다 */}
            <DropdownMenuItem onClick={() => window.open(pagePath, "_blank", "noopener,noreferrer")}>
              <ExternalLink aria-hidden />
              내 페이지 미리보기
            </DropdownMenuItem>
            {/* 누르면 메뉴는 닫히고, 복사 결과는 토스트로 알려 준다 */}
            <DropdownMenuItem onClick={copyPageUrl}>
              <Copy aria-hidden />
              내 페이지 링크 복사
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <p className="px-2 py-1 text-xs text-muted-foreground">Google 계정으로 로그인됨</p>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut aria-hidden />
            로그아웃
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 메뉴의 "링크 추가"로 여는 창. 메뉴가 닫혀도 남아 있도록 메뉴 바깥에 둔다 */}
      <AddLinkDialog uid={user.uid} open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}

// 프로필 사진 (못 불러오면 이름 첫 글자)
function ProfileAvatar({ name, photoURL, size = "sm" }: { name: string; photoURL: string | null; size?: "sm" | "lg" }) {
  return (
    <Avatar size={size}>
      {/* referrerPolicy: 구글 프로필 사진이 가끔 다른 사이트에서 막히는 것을 피함 */}
      {photoURL && <AvatarImage src={photoURL} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}

// "내 링크 N개" — 이미 불러온 내 링크가 있으면 그 수를 쓰고, 없으면(예: 공개 페이지에서 메뉴를 연 경우) 그때 불러온다
// 메뉴 내용은 열릴 때만 그려지므로, 메뉴를 열기 전에는 불러오지 않는다
function MyLinkCount({ uid }: { uid: string }) {
  const loaded = useProfileStore((s) => s.myLinksUid === uid);
  return loaded ? <LinkCountText /> : <LinkCountLoader uid={uid} />;
}

function LinkCountLoader({ uid }: { uid: string }) {
  useMyLinks(uid); // Firestore 에서 내 링크 불러오기 → 끝나면 MyLinkCount 가 LinkCountText 로 바뀜
  return <p className="text-xs text-muted-foreground">링크 수 불러오는 중…</p>;
}

function LinkCountText() {
  const count = useProfileStore((s) => s.myLinks.length);
  return <p className="text-xs font-bold text-muted-foreground">내 링크 {count}개</p>;
}
