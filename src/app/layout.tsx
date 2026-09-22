import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// 이 사이트는 2001년 웹 느낌을 위해 Arial/Courier만 씁니다(globals.css).
// 따라서 웹폰트를 따로 내려받지 않습니다 — 방문자 로딩 속도를 위해서입니다.

export const metadata: Metadata = {
  title: "장호현 (Hohyun Jang) | 프로필 & 링크트리",
  description:
    "사용자 경험과 깨끗한 코드를 지향하는 웹 개발자 장호현입니다. 프로젝트, 기술 스택, 링크 및 연락처를 확인하세요.",
  keywords: ["장호현", "웹 개발자", "프론트엔드", "포트폴리오", "Next.js", "React", "mylink"],
  openGraph: {
    title: "장호현 | 프로필 & 링크트리",
    description: "사용자 경험과 깨끗한 코드를 지향하는 웹 개발자 장호현의 프로필 허브입니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
