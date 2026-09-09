import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
