// 링크 URL에 맞는 아이콘 칸(네모 타일)을 그리는 컴포넌트입니다. (PRD F8 "링크 아이콘 규칙")
// - GitHub·YouTube·Instagram·X·velog: 브랜드 색 칸 + 흰 브랜드 로고 (simple-icons)
// - 메일·일반 블로그·기본 링크: 검정(carbon) 칸 + 흰 lucide 아이콘 (design.md 의 아이콘 칸)
// 공개 페이지의 링크 버튼뿐 아니라, 나중에 대시보드 링크 목록(F5)에서도 그대로 씁니다.

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

  const Glyph = GLYPHS[kind] ?? LinkGlyph;
  return (
    <span className={cn(TILE, "bg-carbon", className)}>
      <Glyph aria-hidden className="size-4" />
    </span>
  );
}
