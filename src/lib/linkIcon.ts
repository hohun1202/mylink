// 링크 URL을 보고 어떤 아이콘을 보여줄지 정하는 규칙입니다. (PRD F8 "링크 아이콘 규칙")
// 아이콘은 데이터에 저장하지 않고, 화면에 그릴 때마다 이 함수로 계산합니다.

// 아이콘 종류 이름 목록
export type LinkIconKind =
  | "github"
  | "youtube"
  | "instagram"
  | "x"
  | "velog" // velog 블로그 (브랜드 로고가 있어 일반 블로그와 나눔)
  | "blog"
  | "mail"
  | "default";

// URL → 아이콘 종류. 위에서부터 차례로 검사해 처음 맞는 규칙을 쓴다
export function getLinkIconKind(url: string): LinkIconKind {
  const u = url.toLowerCase(); // 대소문자 차이 무시

  if (u.startsWith("mailto:")) return "mail"; // 메일 주소
  if (u.includes("github.com")) return "github";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (hostIs(u, "x.com") || u.includes("twitter.com")) return "x";
  if (u.includes("velog.io")) return "velog";
  if (u.includes("blog")) return "blog";
  return "default"; // 어느 규칙에도 안 걸리면 기본 링크 아이콘
}

// "x.com" 은 글자 수가 짧아 "box.com" 같은 다른 주소에도 들어 있으므로,
// 주소의 도메인 부분이 정확히 x.com (또는 www.x.com 등 하위 도메인)인지 확인한다
function hostIs(url: string, domain: string): boolean {
  try {
    const host = new URL(url).hostname; // 예: "https://x.com/abc" → "x.com"
    return host === domain || host.endsWith("." + domain);
  } catch {
    return false; // 주소 형식이 아니면 해당 없음
  }
}
