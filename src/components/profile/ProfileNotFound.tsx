// 없는 사용자 주소(/{displayName})로 접속했을 때의 404 페이지 본문입니다. (PRD F8 · 시나리오 A-1)
// [displayName]/not-found.tsx(서버가 404 판정)와 ProfileView(브라우저에서 못 찾은 드문 경우)가 함께 씁니다.
// 디자인: 다른 페이지 큰 제목과 같은 "흰 글자 + 인디고 각진 그림자" 로 404 를 크게 보여준다 (design.md)

import NextLink from "next/link"; // 앱 안에서 페이지 이동
import { House } from "lucide-react";
import { buttonVariants } from "@/components/ui/button"; // 버튼 모양(클래스)만 빌려 링크에 입힘

export default function ProfileNotFound({ handle }: { handle: string }) {
  return (
    <section className="flex w-full flex-col items-center gap-4 text-center">
      {/* 404 숫자를 아주 크게 */}
      <p aria-hidden className="text-8xl leading-none font-black text-primary-foreground text-shadow-hard">
        404
      </p>
      <h1 className="text-2xl font-black text-foreground">페이지를 찾을 수 없어요</h1>
      <p className="text-sm font-bold text-foreground">
        {/* 방문자가 주소를 잘못 쳤는지 확인할 수 있게 입력한 주소(Username)를 보여줌 */}
        <span className="break-all rounded-sm border-2 border-border bg-card px-1.5 py-0.5 font-mono text-card-foreground">
          /{handle}
        </span>{" "}
        사용자가 없어요.
        <br />
        주소(Username)를 다시 확인해 주세요.
      </p>
      {/* 첫 화면으로 돌아가기 */}
      <NextLink href="/" className={buttonVariants({ variant: "default" })}>
        <House aria-hidden />
        홈으로 가기
      </NextLink>
    </section>
  );
}
