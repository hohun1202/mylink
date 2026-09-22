// 서버가 없으므로, 처음 접속했을 때 LocalStorage에 넣어 줄 "가짜(Mock) 데이터"입니다.
// 원본은 src/mocks/db.json 이고(PRD 5.2), 이 파일은 그 값을 화면용 Profile 모양으로 바꿔 줍니다.
// LocalStorage가 비어 있을 때만 쓰이고, 한 번 저장된 뒤에는 LocalStorage 값이 우선합니다.

import type { Profile } from "./types"; // 데이터 모양(타입)을 가져옴
import db from "@/mocks/db.json"; // 백엔드 DB 모양의 더미 데이터 (users, links 두 묶음)

// 기본 아바타 목록: avatarId → public 폴더 안의 이미지 경로
export const AVATARS: Record<string, string> = {
  default: "/avatar.svg", // 지금은 기본 아바타 1개. 나중에 선택지를 늘릴 자리
};

// db.json → Profile[] 변환
// - 핸들이 없는 사용자(온보딩 전)는 공개 페이지가 없으므로 뺀다
// - 링크는 userId 로 주인을 찾고, order 값이 작은 것부터 배열에 넣는다 (배열 순서 = 화면 순서)
export const MOCK_PROFILES: Profile[] = db.users
  .filter((user) => user.handle !== null) // handle: null 인 사용자 제외
  .map((user) => ({
    handle: user.handle as string, // 위에서 null을 걸렀으므로 문자열로 확정
    name: user.name,
    bio: user.bio,
    avatarId: user.avatarId,
    links: db.links
      .filter((link) => link.userId === user.id) // 이 사용자의 링크만
      .sort((a, b) => a.order - b.order) // order 순으로 정렬
      .map(({ id, title, url }) => ({ id, title, url })), // 화면에 필요한 필드만 남김
  }));
