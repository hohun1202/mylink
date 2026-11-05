// 공개 프로필 페이지의 "주소 담당" 파일입니다. (PRD F8)
// 폴더 이름 [displayName] 의 대괄호는 "주소의 이 자리에 아무 값이나 올 수 있다"는 뜻입니다 (동적 라우팅).
// 예: /hohun1202 로 접속하면 displayName = "hohun1202"
//
// 화면을 그리기 전에 서버에서 먼저 사용자를 찾아 봅니다.
//   - Firestore users 에서 displayName 이 같은 사용자가 있으면 → 그 프로필 + users/{uid}/links 를 화면에 넘김
//   - 없고 샘플 프로필(demo 등)도 아니면 → notFound() 로 404 페이지 (not-found.tsx)
// 서버에서 판단하므로 브라우저도 진짜 "404 Not Found" 상태 코드를 받습니다.

import type { Metadata } from "next";
import { cache } from "react"; // 같은 요청 안에서 같은 조회를 두 번 하지 않게 결과를 기억해 두는 도구
import { notFound } from "next/navigation"; // 부르면 이 주소를 404 페이지로 바꾼다
import ProfileView from "@/components/profile/ProfileView"; // 실제 화면을 그리는 컴포넌트
import { MOCK_PROFILES } from "@/lib/mockData"; // 샘플 프로필 (demo 등)
import { fetchPublicPage, type PublicPage } from "@/lib/publicPage"; // displayName 으로 사용자 + 링크 찾기
import { SITE_NAME, clipDescription } from "@/lib/site"; // 서비스 이름 · 설명 길이 자르기
import { isBioEmpty } from "@/lib/usersFirestore"; // 한 줄 소개가 기본 문구("입력해주세요")인지

// 주소의 이름 → 공개 페이지 데이터. undefined = 서버에서 확인하지 못함(권한 규칙·네트워크 오류)
// cache() 로 감싸서 generateMetadata 와 페이지 본문이 같은 요청에서 Firestore 를 한 번만 조회한다
const loadPage = cache(async (displayName: string): Promise<PublicPage | null | undefined> => {
  try {
    return await fetchPublicPage(displayName);
  } catch (err) {
    console.error("공개 페이지 서버 조회 실패:", err);
    return undefined;
  }
});

// 공개 프로필마다 다른 메타데이터 (검색 결과 제목·설명, 카톡·슬랙 미리보기 카드)
// 공개 페이지에 보이는 것(아이디·소개·링크 수)만 씁니다. 이메일·실명은 넣지 않습니다.
export async function generateMetadata({ params }: PageProps<"/[displayName]">): Promise<Metadata> {
  const { displayName: raw } = await params;
  const displayName = decodeURIComponent(raw);
  const path = `/${encodeURIComponent(displayName)}`; // 대표 주소 (한글 아이디도 안전하게)

  const page = await loadPage(displayName);
  const sample = MOCK_PROFILES.find((p) => p.handle === displayName);

  // 없는 사용자 → 404 화면이 뜨므로 검색 엔진에 색인하지 말라고 알림
  if (page === null && !sample) {
    return { title: "페이지를 찾을 수 없어요", robots: { index: false, follow: false } };
  }

  // 화면에 보이는 이름 · 소개 · 링크 수 (Firestore 사용자 → 샘플 프로필 순서, 공개 페이지와 같음)
  const name = page?.profile.displayName || sample?.name || displayName;
  const bio = page ? (isBioEmpty(page.profile.bio) ? "" : page.profile.bio) : (sample?.bio ?? "");
  const linkCount = page ? page.links.length : (sample?.links.length ?? 0);

  // 이름과 아이디가 같으면(대부분의 실제 사용자) "hohun1202 (@hohun1202)" 처럼 겹치지 않게 한 번만
  const title = name === displayName ? `@${displayName}` : `${name} (@${displayName})`;
  // 소개 끝에 마침표 등이 없으면 붙여서 다음 문장과 자연스럽게 이어지게
  const bioSentence = bio ? (/[.!?。…~]$/.test(bio.trim()) ? bio.trim() : `${bio.trim()}.`) : "";
  const description = clipDescription(
    `${bioSentence ? `${bioSentence} ` : ""}${name} 님의 링크 ${linkCount}개를 ${SITE_NAME} 한 페이지에서 확인하세요.`,
  );

  return {
    title, // layout.tsx 의 template 덕분에 "이름 (@아이디) | mylink" 가 된다
    description,
    alternates: { canonical: path },
    // 미리보기 카드 그림은 같은 폴더의 opengraph-image.tsx 가 자동으로 붙인다
    openGraph: {
      type: "profile",
      siteName: SITE_NAME,
      locale: "ko_KR",
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description,
      username: displayName,
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description },
    // 샘플(demo 등)은 실제 사람 페이지가 아니므로 검색 결과에는 내보내지 않는다
    ...(sample && !page ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ProfilePage({ params }: PageProps<"/[displayName]">) {
  const { displayName: raw } = await params; // Next.js 16에서는 params가 Promise라서 await로 꺼냄
  const displayName = decodeURIComponent(raw); // 주소에 들어간 %xx 글자를 원래 글자로

  // undefined = 서버에서 확인하지 못함(권한 규칙·네트워크 오류) → 404 로 단정하지 않고 브라우저에서 다시 찾게 한다
  const page = await loadPage(displayName); // generateMetadata 가 이미 조회했으면 그 결과를 그대로 받음

  // 그런 사용자가 확실히 없고, 샘플 프로필도 아니면 404
  // (notFound 는 오류를 던지는 방식이라 try 블록 밖에서 불러야 한다 — 안에서 부르면 catch 가 삼켜 버림)
  const isSample = MOCK_PROFILES.some((p) => p.handle === displayName);
  if (page === null && !isSample) notFound();

  return <ProfileView handle={displayName} initialPage={page} />;
}
