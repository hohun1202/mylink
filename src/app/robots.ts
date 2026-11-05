// /robots.txt 를 만드는 파일입니다. (Next.js 파일 규칙)
// 검색 엔진 로봇에게 "어디는 둘러봐도 되고 어디는 오지 마라" + "사이트맵은 여기 있다"를 알려 줍니다.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*", // 모든 검색 엔진 로봇에게
      allow: "/", // 기본적으로 전부 허용하되
      disallow: ["/dashboard", "/mypage", "/stats"], // 로그인한 본인만 보는 화면은 둘러보지 않게
    },
    sitemap: `${SITE_URL}/sitemap.xml`, // 사이트맵 위치
    host: SITE_URL,
  };
}
