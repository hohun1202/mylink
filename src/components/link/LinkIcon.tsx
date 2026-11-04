"use client"; // 파비콘을 못 불러왔을 때(onError) 기본 아이콘으로 바꾸려면 상태가 필요하다

// 링크 URL에 맞는 아이콘 칸(네모 타일)을 그리는 컴포넌트입니다. (PRD F8 "링크 아이콘 규칙")
// - GitHub·YouTube·Instagram·X·velog: 브랜드 색 칸 + 흰 브랜드 로고 (simple-icons)
// - 메일: 검정(carbon) 칸 + 흰 메일 아이콘
// - 그 밖의 모든 사이트(구글·네이버 …): 흰 칸 + 그 사이트의 실제 파비콘
//     파비콘은 Google 파비콘 서비스(s2/favicons)에서 도메인 이름으로 받아 온다.
//     못 받아 오면(주소가 이상함·네트워크 오류) 예전처럼 검정 칸 + 🔗 아이콘으로 대신한다
// 공개 페이지의 링크 버튼뿐 아니라, 나중에 대시보드 링크 목록(F5)에서도 그대로 씁니다.

import { useState } from "react";
import { Link as LinkGlyph, Mail, NotebookPen, type LucideIcon } from "lucide-react";
import { siGithub, siInstagram, siVelog, siX, siYoutube, type SimpleIcon } from "simple-icons";
import { getLinkIconKind, type LinkIconKind } from "@/lib/linkIcon"; // URL → 아이콘 종류
import { cn } from "@/lib/utils";

// 브랜드 로고: 로고 모양(simple-icons) + 칸 배경색 클래스(globals.css 의 --logo-* 토큰)
// Tailwind는 코드에 적힌 클래스 이름만 CSS로 만들므로, 클래스 이름을 문자열로 통째로 적어 둔다
const BRANDS: Partial<Record<LinkIconKind, { icon: SimpleIcon; bg: string }>> = {
  github: { icon: siGithub, bg: "bg-logo-github" },
  youtube: { icon: siYoutube, bg: "bg-logo-youtube" },
  instagram: { icon: siInstagram, bg: "bg-logo-instagram" },
  x: { icon: siX, bg: "bg-logo-x" },
  velog: { icon: siVelog, bg: "bg-logo-velog" },
};

// 브랜드가 아닌 종류는 lucide 아이콘으로
const GLYPHS: Partial<Record<LinkIconKind, LucideIcon>> = {
  blog: NotebookPen,
  mail: Mail,
  default: LinkGlyph,
};

// 칸 공통 모양: 32px 네모 + 인디고 테두리 + 흰 아이콘
const TILE = "flex size-8 shrink-0 items-center justify-center border border-border text-carbon-foreground";

export default function LinkIcon({ url, className }: { url: string; className?: string }) {
  const kind = getLinkIconKind(url);
  const brand = BRANDS[kind];

  if (brand) {
    return (
      <span className={cn(TILE, brand.bg, className)}>
        {/* simple-icons 로고는 24×24 크기 기준의 경로(path) 한 줄로 되어 있다 */}
        <svg viewBox="0 0 24 24" aria-hidden className="size-4 fill-current">
          <path d={brand.icon.path} />
        </svg>
      </span>
    );
  }

  // 메일이 아니면 그 사이트의 진짜 파비콘을 먼저 시도한다
  if (kind !== "mail") return <FaviconTile url={url} fallback={GLYPHS[kind] ?? LinkGlyph} className={className} />;

  return <GlyphTile glyph={GLYPHS[kind] ?? LinkGlyph} className={className} />;
}

// 검정 칸 + 흰 lucide 아이콘 (메일, 그리고 파비콘을 못 불러왔을 때)
function GlyphTile({ glyph: Glyph, className }: { glyph: LucideIcon; className?: string }) {
  return (
    <span className={cn(TILE, "bg-carbon", className)}>
      <Glyph aria-hidden className="size-4" />
    </span>
  );
}

// 사이트 파비콘 주소: Google 파비콘 서비스에 도메인 이름만 넘긴다 (예: naver.com → 네이버 초록 N 로고)
// sz=64: 32px 칸에 그리지만 레티나 화면에서도 선명하게 2배 크기로 받는다
function faviconUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname; // "https://www.naver.com/abc" → "www.naver.com"
    return host ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64` : null;
  } catch {
    return null; // 주소 형식이 아니면 파비콘을 찾을 수 없음
  }
}

// 흰 칸 + 사이트 파비콘. 파비콘은 색이 제각각이라(검정 로고도 있음) 검정 대신 흰 칸에 둔다
function FaviconTile({ url, fallback, className }: { url: string; fallback: LucideIcon; className?: string }) {
  const src = faviconUrl(url);
  const [failedSrc, setFailedSrc] = useState<string | null>(null); // 불러오기에 실패한 파비콘 주소

  // 주소가 이상하거나, 이 파비콘을 이미 못 불러왔으면 기본 아이콘
  // (링크 주소를 고치면 src 가 달라지므로 새 주소의 파비콘을 다시 시도한다)
  if (!src || failedSrc === src) return <GlyphTile glyph={fallback} className={className} />;

  return (
    <span className={cn(TILE, "bg-white", className)}>
      {/* 바깥 사이트 이미지라 next/image 최적화 대신 일반 img 를 쓴다 (작은 아이콘이라 최적화 이득이 없음) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={20}
        height={20}
        loading="lazy" // 화면에 보일 때 불러온다
        referrerPolicy="no-referrer" // 어느 페이지에서 불렀는지(내 주소)를 Google 에 보내지 않음
        onError={() => setFailedSrc(src)}
        className="size-5"
      />
    </span>
  );
}
