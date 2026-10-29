"use client"; // 클릭·로그인 진행 상태를 다루므로 클라이언트 컴포넌트

// "Google로 로그인" 버튼입니다. 헤더와 로그인 안내 화면이 같은 버튼을 씁니다.
// 누르면 구글 로그인 팝업이 뜨고, 팝업이 떠 있는 동안에는 버튼이 잠기고 도는 아이콘이 나옵니다.

import { LoaderCircle } from "lucide-react";
import { siGoogle } from "simple-icons"; // 구글 "G" 로고 모양
import { Button } from "@/components/ui/button";
import { signInWithGoogle, useAuthStore } from "@/store/useAuthStore";

type GoogleLoginButtonProps = {
  size?: "sm" | "default" | "lg"; // 헤더에서는 작게, 안내 화면에서는 크게
  label?: string; // 버튼 글자 (헤더: "Google로 로그인", 랜딩: "Google로 계속하기")
  className?: string;
};

export default function GoogleLoginButton({ size = "default", label = "Google로 로그인", className }: GoogleLoginButtonProps) {
  const signingIn = useAuthStore((s) => s.signingIn); // 팝업이 떠 있는 중인지

  return (
    // bevel: design.md 의 입체 금속판 버튼
    <Button type="button" variant="bevel" size={size} className={className} onClick={signInWithGoogle} disabled={signingIn}>
      {signingIn ? (
        <LoaderCircle className="animate-spin" aria-hidden />
      ) : (
        // simple-icons 로고는 24×24 기준 경로 한 줄. 구글 파란색(#4285F4)으로 칠한다
        <svg viewBox="0 0 24 24" aria-hidden className="fill-[#4285F4]">
          <path d={siGoogle.path} />
        </svg>
      )}
      <span className="font-bold">{signingIn ? "로그인 중…" : label}</span>
    </Button>
  );
}
