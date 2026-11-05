// 공개 프로필(/아이디) 의 오픈 그래프 이미지입니다. (동적 경로 — 사람마다 다른 그림)
// Next.js 파일 규칙: 이 폴더에 opengraph-image.tsx 를 두면 /아이디 페이지의 <head> 에
// <meta property="og:image" content="/아이디/opengraph-image…"> 가 자동으로 붙습니다.
//
// 디자인: 정적 그림(src/app/opengraph-image.tsx)과 같은 "랜딩 히어로 화면" — 부품도 src/lib/og.tsx 에서 같이 씁니다.
//   맨 위 — 사이트 헤더 띠 (mylink 로고 + 오른쪽에 mylink/아이디)
//   왼쪽 — 주황 딱지 · 이름 / "in One Link." (흰 글자 + 인디고 그림자, 빨강 강조) · 한 줄 소개 · [🔗 mylink/아이디] · 링크 N개 →
//   오른쪽 — 휴대폰 미리보기: 이 사람의 실제 공개 페이지 (사진 · 이름 · 소개 · 링크 최대 5줄)
// 데이터는 공개 페이지(page.tsx)와 같은 순서로 찾습니다: Firestore 사용자 → 샘플 프로필 → 없음.
// 공개 페이지에 보이는 것(이름=displayName · 소개 · 사진 · 링크)만 씁니다. 이메일·실명은 넣지 않습니다.
//
// 배포 환경(Vercel)에서도 깨지지 않게:
//   - 서버 파일(public/ 등)을 읽지 않는다 (서버리스 함수에는 public/ 이 없음) → 사진이 없으면 👾 이모지
//   - 바깥 요청(사진·글꼴)은 4초 제한 → 느려도 그림이 끝없이 로딩되지 않음
//   - 그리다가 오류가 나도 빈 응답("페이지가 작동하지 않습니다") 대신 간단한 그림으로 대신한다

import { ImageResponse } from "next/og";
import {
  BevelButton,
  C,
  Chip,
  HEADLINE,
  HeroFrame,
  HeroPhone,
  LineIcon,
  OG_SIZE,
  SHAPES,
  clipWidth,
  heroFonts,
  textUnits,
} from "@/lib/og";
import { MOCK_PROFILES } from "@/lib/mockData"; // 샘플 프로필 (demo 등)
import { fetchPublicPage } from "@/lib/publicPage"; // displayName → 사용자 + 링크
import { isBioEmpty } from "@/lib/usersFirestore"; // 기본 문구("입력해주세요")인지

export const alt = "mylink 공개 프로필 미리보기"; // <meta property="og:image:alt">
export const size = OG_SIZE; // 1200×630
export const contentType = "image/png";

const MAX_ROWS = 5; // 휴대폰 안에 들어가는 링크 줄 수 (더 많으면 4줄 + "+N개 더")
const PHOTO_TYPES = ["image/png", "image/jpeg", "image/gif"]; // OG 엔진이 읽을 수 있는 사진 형식

// 그림에 넣을 프로필 정보 (화면에 보이는 값만)
type OgProfile = {
  handle: string; // 주소의 아이디
  name: string; // 큰 글자로 보일 이름
  bio: string; // 한 줄 소개 (없으면 "")
  photo: string | null; // 사진 data URL (없으면 👾)
  links: { title: string; url: string }[];
  exists: boolean; // 실제로 있는 페이지인지
};

// 사진 주소 → data URL. 4초 제한, OG 엔진이 읽을 수 있는 형식(png·jpeg·gif)만. 실패하면 null
async function photoDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const type = (res.headers.get("content-type") ?? "").split(";")[0];
    if (!res.ok || !PHOTO_TYPES.includes(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

// 아이디로 프로필 찾기: Firestore 사용자 → 샘플 프로필 → 없음 (page.tsx 와 같은 순서)
async function findProfile(handle: string): Promise<OgProfile> {
  try {
    const page = await fetchPublicPage(handle);
    if (page) {
      // 구글 사진 주소 끝의 "=s96-c"(96px)를 "=s256-c" 로 바꿔 선명하게 받는다
      const photoUrl = page.profile.photoURL?.replace(/=s\d+-c$/, "=s256-c");
      return {
        handle,
        name: page.profile.displayName || handle,
        bio: isBioEmpty(page.profile.bio) ? "" : page.profile.bio, // 기본 문구는 방문자에게 숨김 (공개 페이지와 같음)
        photo: photoUrl ? await photoDataUrl(photoUrl) : null,
        links: page.links.map((l) => ({ title: l.title, url: l.url })),
        exists: true,
      };
    }
  } catch (err) {
    console.error("OG 이미지: 공개 페이지 조회 실패:", err); // 실패해도 샘플/없음으로 계속 그린다
  }
  const sample = MOCK_PROFILES.find((p) => p.handle === handle);
  if (sample) {
    return { handle, name: sample.name, bio: sample.bio, photo: null, links: sample.links.map((l) => ({ title: l.title, url: l.url })), exists: true };
  }
  return { handle, name: handle, bio: "", photo: null, links: [], exists: false };
}

// 프로필 하나를 히어로 그림으로 그린다
async function render(p: OgProfile) {
  const bio = p.exists ? p.bio || "Showcase my git, blog, and more." : "아직 만들어지지 않은 페이지예요";
  // 링크가 5개 이하면 다 보여 주고, 더 많으면 4줄 + "+N개 더"
  const shown = p.links.length <= MAX_ROWS ? p.links : p.links.slice(0, MAX_ROWS - 1);
  const more = p.links.length - shown.length;
  const countText = p.links.length > 0 ? `링크 ${p.links.length}개 보기` : "링크 준비 중";

  // 이름: 왼쪽 칸(약 600px)에 한 줄로 들어가게 글자 크기를 정한다 (한글 1칸 · 영문 0.6칸 기준)
  const name = clipWidth(p.name, 14);
  const nameSize = Math.max(48, Math.min(86, Math.floor(600 / Math.max(textUnits(name), 1))));
  const shownBio = clipWidth(bio, 30);

  const fonts = await heroFonts(
    [name, shownBio, countText, p.name, p.handle, "★ MY LINK PAGE in One Link. 개 더 아직 링크가 없어요 …", ...shown.map((l) => l.title)].join(""),
    `mylink/${p.handle}…`,
  );

  // 아바타: 사진이 있으면 사진, 없으면 👾 (랜딩 미리보기와 같은 이모지)
  const avatar = p.photo ? <img src={p.photo} alt="" width={58} height={58} style={{ objectFit: "cover" }} /> : "👾";

  return new ImageResponse(
    (
      <HeroFrame headerRight={<BevelButton icon={<LineIcon size={16} color={C.indigo}>{SHAPES.link}</LineIcon>} label={`mylink/${clipWidth(p.handle, 18)}`} mono />}>
        {/* 왼쪽: 이름 헤드라인 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 620 }}>
          <Chip>★ MY LINK PAGE</Chip>

          {/* "이름 / in One Link." — 랜딩 헤드라인과 같은 모양, "One Link." 만 빨강 */}
          <div style={{ display: "flex", flexDirection: "column", ...HEADLINE }}>
            <span style={{ fontSize: nameSize }}>{name}</span>
            <div style={{ display: "flex", fontSize: 72 }}>
              <span>in&nbsp;</span>
              <span style={{ color: C.red }}>One Link.</span>
            </div>
          </div>

          {/* 한 줄 소개 */}
          <span style={{ fontSize: 26, fontWeight: 700 }}>{shownBio}</span>

          {/* 버튼 줄: [🔗 mylink/아이디]  링크 N개 보기 → */}
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 6 }}>
            <BevelButton icon={<LineIcon size={24} color={C.indigo}>{SHAPES.link}</LineIcon>} label={`mylink/${clipWidth(p.handle, 12)}`} big mono />
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 22, fontWeight: 700 }}>
              {countText}
              <LineIcon size={20} color={C.carbon}>
                {SHAPES.arrowRight}
              </LineIcon>
            </div>
          </div>
        </div>

        {/* 오른쪽: 이 사람의 공개 페이지를 담은 휴대폰 */}
        <HeroPhone handle={p.handle} avatar={avatar} name={p.name} bio={p.bio} links={shown} more={more} />
      </HeroFrame>
    ),
    { ...size, fonts },
  );
}

// 그림을 끝까지 만들어 본 뒤 돌려준다. 그리는 도중 오류가 나면 잡아서 null
// (ImageResponse 는 응답을 보내는 도중에 그리기 때문에, 미리 다 그려 보지 않으면 오류가 빈 응답으로 끊긴다)
async function tryRender(p: OgProfile): Promise<Response | null> {
  try {
    const res = await render(p); // ImageResponse (아직 그리기 전 — 읽기 시작하면 그린다)
    const png = await res.arrayBuffer(); // 여기서 끝까지 그려 보고, 오류가 나면 catch 로
    // ImageResponse 가 정해 둔 헤더(content-type · cache-control)를 그대로 옮겨 붙인다
    return new Response(png, { headers: res.headers });
  } catch (err) {
    console.error("OG 이미지 그리기 실패:", err);
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ displayName: string }> }) {
  const { displayName } = await params; // Next.js 16 에서는 params 가 Promise
  const handle = decodeURIComponent(displayName); // 주소의 %xx 를 원래 글자로

  const profile = await findProfile(handle);
  // 1차: 사진·링크까지 다 넣은 그림 → 실패하면 2차: 사진·링크 없이 이름만 넣은 그림
  return (
    (await tryRender(profile)) ??
    (await tryRender({ ...profile, photo: null, links: [] })) ??
    new Response("OG image error", { status: 500 })
  );
}
