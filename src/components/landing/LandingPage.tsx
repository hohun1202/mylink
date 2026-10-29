"use client"; // 로그인 버튼(클릭)을 담으므로 클라이언트 컴포넌트

// 로그인하지 않은 사람에게 첫 화면(/)에서 보여주는 소개 페이지입니다. (와이어프레임 2.1 메인 랜딩)
//   헤드라인: "Development in One Link." / "Showcase your git, blog, and more."
//   CTA 버튼: [G Google로 계속하기]
// 아래에 로그인하면 무엇을 할 수 있는지 안내 문구를 덧붙입니다.

import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function LandingPage() {
  return (
    <section className="flex w-full flex-col items-center gap-8 py-8 text-center">
      {/* 헤드라인: 흰 글자 + 인디고 각진 그림자 (design.md 큰 제목) */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl leading-tight font-black text-primary-foreground text-shadow-hard">
          Development
          <br />
          in One Link.
        </h1>
        <p className="text-base font-bold text-foreground">Showcase your git, blog, and more.</p>
      </div>

      {/* CTA 버튼 */}
      {/* 로그인에 실패하면(팝업 차단 등) 토스트로 알려 준다 */}
      <GoogleLoginButton size="lg" label="Google로 계속하기" className="h-12 w-full text-base" />

      {/* 로그인 유도 안내 */}
      <p className="rounded-sm border-2 border-border bg-card p-4 text-sm text-card-foreground shadow-hard">
        로그인하면 깃허브·블로그 같은 내 링크를 한 페이지에 모아
        <br />
        추가·수정·삭제할 수 있어요. 링크는 내 계정에만 따로 저장돼요.
      </p>
    </section>
  );
}
