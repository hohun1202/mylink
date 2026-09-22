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

// 형식이 틀렸을 때 보여줄 문구 (예시 주소를 함께 보여줌)
export const URL_FORMAT_ERROR = "올바른 URL 형식이 아닙니다 (예: https://example.com).";

function checkUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "URL을 입력해 주세요";
  if (/\s/.test(trimmed)) return URL_FORMAT_ERROR; // 주소 중간에 공백

  const url = normalizeUrl(trimmed);

  // 메일 링크: mailto:이름@도메인.xx 형식만 허용 (F8 아이콘 규칙의 "메일"용)
  if (url.toLowerCase().startsWith("mailto:")) {
    return /^mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(url) ? null : "메일 주소 형식이 올바르지 않아요 (예: mailto:me@example.com)";
  }

  // http(s):// 로 시작해야 한다 (ftp:// 등 거절)
  if (!/^https?:\/\//i.test(url)) return URL_FORMAT_ERROR;

  try {
    new URL(url); // 주소 형식이 아니면 여기서 오류가 난다 (예: "https://")
  } catch {
    return URL_FORMAT_ERROR;
  }

  // 도메인은 브라우저가 해석한 값이 아니라 "입력한 글자 그대로"로 검사한다.
  // (브라우저는 "1234444" 같은 숫자를 IP 주소 0.18.214.12 로 바꿔 버려 점이 있는 것처럼 보이게 만듦)
  const host = url.replace(/^https?:\/\//i, "").split(/[/?#:]/)[0]; // 예: "github.com/abc" → "github.com"
  const labels = host.split(".");
  const tld = labels[labels.length - 1]; // 맨 끝 조각 (com, io, kr …)
  // 점으로 나뉜 조각이 2개 이상이고, 빈 조각이 없고, 맨 끝이 영문 2글자 이상이어야 한다
  // → "abc", "abc.", "1234444", "1.2.3.4", "example.c" 거절
  if (labels.length < 2 || labels.some((l) => l === "") || !/^[a-z]{2,}$/i.test(tld)) {
    return URL_FORMAT_ERROR;
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
