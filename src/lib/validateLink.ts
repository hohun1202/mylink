// 링크 입력값(제목·URL) 검사 규칙입니다. (PRD F5 — 추가·수정 공통)
// 화면 코드와 떼어 두어, 나중에 링크 수정(B-3)에서도 그대로 씁니다.

export type LinkInput = { title: string; url: string }; // 폼에 입력한 값
export type LinkErrors = Partial<Record<keyof LinkInput, string>>; // 칸별 오류 문구

// 검사 결과: 오류가 없으면 저장할 값(value)을, 있으면 오류 문구(errors)를 돌려준다
export type LinkValidation =
  | { ok: true; value: LinkInput }
  | { ok: false; errors: LinkErrors };

// "github.com/abc" 처럼 앞부분(https://)을 빼고 쓰면 자동으로 붙여 준다 (PRD 10장 6번 → 자동 보정으로 결정)
export function normalizeUrl(raw: string): string {
  const url = raw.trim();
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(url); // "https:", "mailto:" 같은 머리말이 있는지
  return hasScheme ? url : `https://${url}`;
}

function checkUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "URL을 입력해 주세요";
  if (/\s/.test(trimmed)) return "주소에 공백이 들어갈 수 없어요";

  const url = normalizeUrl(trimmed);

  // 메일 링크: mailto:이름@도메인.xx 형식만 허용 (F8 아이콘 규칙의 "메일"용)
  if (url.toLowerCase().startsWith("mailto:")) {
    return /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(url) ? null : "메일 주소 형식이 올바르지 않아요";
  }

  let parsed: URL;
  try {
    parsed = new URL(url); // 주소 형식이 아니면 여기서 오류가 난다 (예: "https://")
  } catch {
    return "올바른 주소 형식이 아니에요";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "http:// 또는 https:// 로 시작하는 주소를 입력해 주세요";
  }
  // 도메인에 점(.)이 있고, 점으로 나뉜 조각이 비어 있지 않아야 한다 (예: "abc", "abc." 거절)
  const labels = parsed.hostname.split(".");
  if (labels.length < 2 || labels.some((l) => l === "")) {
    return "도메인이 올바르지 않아요 (예: example.com)";
  }
  return null; // 통과
}

export function validateLink(input: LinkInput): LinkValidation {
  const errors: LinkErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = "제목을 입력해 주세요";

  const urlError = checkUrl(input.url);
  if (urlError) errors.url = urlError;

  if (errors.title || errors.url) return { ok: false, errors };
  return { ok: true, value: { title, url: normalizeUrl(input.url) } };
}
