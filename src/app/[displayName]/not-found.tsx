"use client"; // 주소(usePathname)를 읽으려면 클라이언트 컴포넌트여야 한다 (not-found 파일은 params 를 받지 못함)

// /{displayName} 에서 그런 사용자가 없을 때(page.tsx 가 notFound() 를 부름) 보여주는 404 페이지입니다.

import { usePathname } from "next/navigation"; // 지금 주소 (예: /nobody)
import ProfileNotFound from "@/components/profile/ProfileNotFound"; // "페이지를 찾을 수 없어요" 안내

export default function DisplayNameNotFound() {
  // 404 화면에서는 useParams 가 서버 렌더링 때 값을 못 주므로, 주소 전체에서 맨 앞 "/" 만 떼어 쓴다
  const displayName = decodeURIComponent((usePathname() ?? "").replace(/^\//, ""));

  return (
    // 공개 페이지(ProfileView)와 같은 배경·폭
    <main className="flex flex-1 justify-center bg-background px-4 py-12 text-base text-foreground">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <ProfileNotFound handle={displayName} />
      </div>
    </main>
  );
}
