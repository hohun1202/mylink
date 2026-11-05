// 공개 프로필(/아이디) 의 오픈 그래프 이미지입니다. (동적 경로 — 사람마다 다른 그림)
// Next.js 파일 규칙: 이 폴더에 opengraph-image.tsx 를 두면 /아이디 페이지의 <head> 에
// <meta property="og:image" content="/아이디/opengraph-image…"> 가 자동으로 붙습니다.
//
// 그림 구성 (1200×630, 디자인은 사이트와 같은 Nintendo 2001 금속판):
//   왼쪽 — 주황 딱지 · 프로필 사진 · 이름(흰 글자 + 인디고 그림자) · 한 줄 소개 · 링크 개수
//   오른쪽 — 휴대폰 모형: 주소창 mylink/아이디 + 실제 링크 줄 최대 4개 (+N개 더)
//   아래 — 검정 띠 (mylink 로고 · 슬로건)
// 데이터는 공개 페이지(page.tsx)와 같은 순서로 찾습니다: Firestore 사용자 → 샘플 프로필 → 없음.
// 공개 페이지에 보이는 것(이름=displayName · 소개 · 사진 · 링크)만 씁니다. 이메일·실명은 넣지 않습니다.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { C, HEADLINE, OG_SIZE, OgChip, OgFrame, OgPhone, clip, loadFonts } from "@/lib/og";
import { MOCK_PROFILES } from "@/lib/mockData"; // 샘플 프로필 (demo 등)
import { fetchPublicPage } from "@/lib/publicPage"; // displayName → 사용자 + 링크
import { isBioEmpty } from "@/lib/usersFirestore"; // 기본 문구("입력해주세요")인지

export const alt = "mylink 공개 프로필 미리보기"; // <meta property="og:image:alt">
export const size = OG_SIZE; // 1200×630
export const contentType = "image/png";

const MAX_ROWS = 4; // 휴대폰 안에 보여 줄 링크 줄 수

// 이미지 주소 → data URL (Satori 가 그림을 확실히 넣도록 미리 받아 둔다). 실패하면 null
async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

// 사진이 없을 때 쓰는 기본 아바타 (public/avatar.svg)
async function defaultAvatar(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "public/avatar.svg"));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ displayName: string }> }) {
  const handle = decodeURIComponent((await params).displayName); // 주소의 %xx 를 원래 글자로

  // 1) Firestore 사용자 → 2) 샘플 프로필 → 3) 없음 (page.tsx 와 같은 순서)
  let page = null;
  try {
    page = await fetchPublicPage(handle);
  } catch (err) {
    console.error("OG 이미지: 공개 페이지 조회 실패:", err); // 실패해도 그림은 그린다 (샘플/없음으로)
  }
  const sample = page ? undefined : MOCK_PROFILES.find((p) => p.handle === handle);

  const name = page?.profile.displayName ?? sample?.name ?? handle;
  const rawBio = page ? (isBioEmpty(page.profile.bio) ? "" : page.profile.bio) : (sample?.bio ?? "");
  const exists = Boolean(page || sample);
  const bio = exists ? rawBio : "아직 만들어지지 않은 페이지예요";
  const links = page?.links ?? sample?.links ?? [];
  const shown = links.slice(0, MAX_ROWS).map((l) => ({ title: l.title, url: l.url }));

  // 프로필 사진: 구글 사진이 있으면 받아 오고, 없거나 실패하면 기본 아바타
  // 구글 사진 주소 끝의 "=s96-c"(96px)를 "=s256-c" 로 바꿔 크게 받는다 (그림에서 132px 로 쓰므로 선명하게)
  const photoUrl = page?.profile.photoURL?.replace(/=s\d+-c$/, "=s256-c");
  const photo = (photoUrl && (await toDataUrl(photoUrl))) || (await defaultAvatar());

  // 이름 길이에 따라 글자 크기 조절 (긴 이름도 한두 줄 안에)
  const nameLen = Array.from(name).length;
  const nameSize = nameLen <= 8 ? 88 : nameLen <= 14 ? 68 : 52;

  const shownName = clip(name, 24);
  const shownBio = clip(bio, 44);
  const countText = links.length > 0 ? `링크 ${links.length}개` : "링크 준비 중";
  const emptyText = "아직 링크가 없어요";

  // 그림에 들어가는 글자를 모두 모아 그 글자만 담은 글꼴을 받는다
  const fonts = await loadFonts(
    [shownName, shownBio, countText, emptyText, handle, "MY LINK PAGE 개 더", ...shown.map((l) => l.title)].join(""),
  );

  return new ImageResponse(
    (
      <OgFrame>
        {/* 왼쪽: 프로필 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, paddingRight: 48 }}>
          <OgChip>★ MY LINK PAGE</OgChip>

          {/* 프로필 사진: 원형 + 검정 굵은 테두리 + 각진 그림자 (화면의 framed 아바타) */}
          <img
            src={photo}
            alt=""
            width={132}
            height={132}
            style={{
              borderRadius: 999,
              border: `6px solid ${C.carbon}`,
              backgroundColor: C.white,
              boxShadow: `6px 6px 0 ${C.carbon}`,
              objectFit: "cover",
            }}
          />

          {/* 이름: 흰 글자 + 인디고 그림자 */}
          <div style={{ display: "flex", fontSize: nameSize, ...HEADLINE }}>{shownName}</div>

          {/* 한 줄 소개 (없으면 생략) */}
          {shownBio && <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: C.carbon, lineHeight: 1.35 }}>{shownBio}</div>}

          {/* 링크 개수: 빨간 작은 판 */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "6px 16px",
              backgroundColor: C.red,
              color: C.white,
              fontSize: 24,
              fontWeight: 900,
              boxShadow: `4px 4px 0 ${C.carbon}`,
              borderRadius: 3,
            }}
          >
            {countText}
          </div>
        </div>

        {/* 오른쪽: 휴대폰 모형 — 실제 링크 줄 */}
        <OgPhone handle={handle} links={shown} more={links.length - shown.length}>
          {shown.length === 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 120,
                fontSize: 26,
                ...HEADLINE,
                textShadow: `3px 3px 0 ${C.indigo}`,
              }}
            >
              {emptyText}
            </div>
          )}
        </OgPhone>
      </OgFrame>
    ),
    { ...size, fonts },
  );
}
