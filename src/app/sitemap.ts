// /sitemap.xml 을 만드는 파일입니다. (Next.js 파일 규칙)
// 검색 엔진에게 "이 사이트에 이런 페이지들이 있다"는 목록을 건네 색인을 빠르게 합니다.
//   - 첫 화면(/)
//   - 모든 사용자의 공개 프로필 (/아이디) — Firestore users 컬렉션에서 읽음
// 로그인 전용 화면(/dashboard, /mypage, /stats)은 넣지 않습니다.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { listDisplayNames } from "@/lib/usersFirestore";

// 사용자가 새로 가입해도 목록이 갱신되도록 1시간마다 다시 만든다
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  };

  // Firestore 조회가 실패해도(네트워크·설정 문제) 첫 화면만이라도 담긴 사이트맵을 돌려준다
  let names: string[] = [];
  try {
    names = await listDisplayNames();
  } catch (err) {
    console.error("사이트맵용 사용자 목록 조회 실패:", err);
  }

  return [
    home,
    ...names.map((name) => ({
      url: `${SITE_URL}/${encodeURIComponent(name)}`,
      changeFrequency: "daily" as const, // 링크를 자주 추가·수정하는 페이지
      priority: 0.8,
    })),
  ];
}
