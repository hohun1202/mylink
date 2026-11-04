// Firestore 의 유저 프로필 문서(users/{uid})를 다루는 함수들입니다.
// 링크는 그 아래 하위 컬렉션 users/{uid}/links 에 따로 있습니다 (linksFirestore.ts).
//
//   users/
//   └── {uid}            ← 이 파일: uid · displayName · username · email · photoURL · bio
//       ├── profile/
//       │   └── main     ← 이 파일: 마이페이지 [프로필 수정]으로 저장한 프로필 (username · name · bio · updatedAt)
//       └── links/       ← linksFirestore.ts: 링크 문서들
//
// ⚠️ 필드 이름이 두 문서에서 다르게 쓰인다 (users/{uid} 는 예전부터 쓰던 이름이라 그대로 둠)
//   뜻                         users/{uid}     users/{uid}/profile/main
//   아이디 = 공개 주소(겹치면 안 됨)  displayName     username
//   이름(실명)                   username        name
//   한 줄 소개                   bio             bio

import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuthUser } from "@/store/useAuthStore";

// 처음 만들 때 넣는 한 줄 소개 (사용자가 아직 소개를 안 쓴 상태)
export const DEFAULT_BIO = "한 줄 소개를 입력해주세요.";

// 이름(실명) 최대 글자 수 (PRD F4 기본안)
export const NAME_MAX_LENGTH = 30;

// 한 줄 소개 최대 글자 수
export const BIO_MAX_LENGTH = 60;

// 아직 소개를 안 쓴 상태인지 (빈 칸이거나 기본 문구 그대로)
export function isBioEmpty(bio: string | null | undefined): boolean {
  return !bio || bio === DEFAULT_BIO;
}

// 화면에 보여줄 유저 프로필 모양 (users/{uid} 문서 내용)
export type UserProfile = {
  displayName: string; // 화면에 보이는 이름 = 이메일의 @ 앞부분 (예: hohun1202)
  username: string | null; // 구글 계정 실명 (예: 장호현)
  email: string | null; // 구글 이메일
  photoURL: string | null; // 프로필 사진 주소 (구글 프로필 사진)
  bio: string; // 한 줄 소개
};

function userDoc(uid: string) {
  return doc(db, "users", uid);
}

// 문서 데이터 → 화면용 UserProfile 모양
function toProfile(data: Record<string, unknown>): UserProfile {
  return {
    displayName: (data.displayName as string) ?? "",
    username: (data.username as string) ?? null,
    email: (data.email as string) ?? null,
    photoURL: (data.photoURL as string) ?? null,
    bio: (data.bio as string) ?? "",
  };
}

// 내 공개 페이지 주소는 /{displayName} 이다 (예: /hohun1202). 미리보기·링크 복사에 쓴다
export function publicPagePath(displayName: string): string {
  return `/${encodeURIComponent(displayName)}`;
}

// 공개 페이지(/{displayName})를 열었을 때: displayName 이 같은 사용자를 찾는다
// users 컬렉션에서 displayName == 주소의 이름 인 문서를 1개만 가져온다. 없으면 null
// (주의: 이메일 앞부분이 같은 두 계정 — 예: abc@gmail.com 과 abc@naver.com — 이 있으면 먼저 찾은 한 명만 나온다)
export async function findUserByDisplayName(displayName: string): Promise<{ uid: string; profile: UserProfile } | null> {
  const snapshot = await getDocs(query(collection(db, "users"), where("displayName", "==", displayName), limit(1)));
  const found = snapshot.docs[0];
  return found ? { uid: found.id, profile: toProfile(found.data()) } : null;
}

// 로그인 직후 부른다: users/{uid} 문서를 아래 모양으로 맞춘다
//   uid · displayName(이메일 앞부분) · username(구글 실명) · email · photoURL · bio
// - 문서가 없으면(= 처음 로그인) 새로 만든다
// - 이미 있으면 사용자가 고칠 수 있는 bio 는 건드리지 않고, 빠진 필드만 채운다
//   (예전 코드가 만든 문서의 name·createdAt 필드는 지워서 위 모양으로 정리한다)
export async function ensureUserProfile(user: AuthUser): Promise<void> {
  const snapshot = await getDoc(userDoc(user.uid));
  const base = {
    uid: user.uid,
    displayName: user.name, // AuthUser.name 이 이미 이메일 앞부분
    username: user.username,
    email: user.email,
    photoURL: user.photoURL,
  };

  if (!snapshot.exists()) {
    await setDoc(userDoc(user.uid), { ...base, bio: DEFAULT_BIO });
    return;
  }

  const data = snapshot.data();
  // 이미 올바른 모양이면 아무것도 하지 않는다 (매번 쓰지 않도록)
  if (data.displayName && data.uid && !("name" in data) && !("createdAt" in data)) return;
  // merge: true → 적은 필드만 바꾸고 나머지(bio 등)는 그대로 둔다
  await setDoc(
    userDoc(user.uid),
    {
      ...base,
      displayName: data.displayName || base.displayName, // 이미 있으면 그대로
      bio: data.bio || DEFAULT_BIO, // 비어 있으면 기본 문구
      name: deleteField(), // 옛 필드 정리
      createdAt: deleteField(),
    },
    { merge: true },
  );
}

// users/{uid} 문서를 한 번 읽어 온다 (실시간 구독 아님). 문서가 아직 없으면 null
// 화면에서는 TanStack Query(useProfileQuery)가 이 함수를 불러 결과를 캐시에 보관한다
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userDoc(uid));
  const data = snapshot.data();
  return data ? toProfile(data) : null;
}

// ───────── 표시 이름(displayName) 규칙 ─────────
// displayName 은 화면에 보이는 이름이면서 동시에 내 공개 페이지 주소(/{displayName})다.
// 그래서 (1) 주소에 쓸 수 있는 글자만, (2) 앱의 다른 주소와 겹치지 않게, (3) 다른 사람과 겹치지 않게 해야 한다.

// 글자 수 범위 (PRD F3 핸들 규칙 기본안)
export const DISPLAY_NAME_MIN_LENGTH = 3;
export const DISPLAY_NAME_MAX_LENGTH = 20;

// 허용 글자: 영문 소문자·숫자·밑줄(_). 첫 글자는 영문 소문자나 숫자 (밑줄로 시작하면 Next.js 내부 주소 /_next 와 헷갈림)
// ^ = 처음, $ = 끝, [a-z0-9] = 소문자나 숫자 한 글자, [a-z0-9_]* = 소문자·숫자·밑줄이 0개 이상
const DISPLAY_NAME_PATTERN = /^[a-z0-9][a-z0-9_]*$/;

// 예약어: 앱에 이미 있는 주소(/mypage, /dashboard …)나 앞으로 쓸 주소와 겹치는 이름은 못 쓴다
// 예) 누가 이름을 "mypage" 로 바꾸면 /mypage 가 마이페이지인지 그 사람 공개 페이지인지 알 수 없게 된다
const RESERVED_DISPLAY_NAMES = new Set(["mypage", "dashboard", "login", "logout", "onboarding", "settings", "api", "admin"]);

// 형식 검사: 문제가 있으면 화면에 보여줄 문구를, 괜찮으면 null 을 돌려준다 (Firestore 는 보지 않는 빠른 검사)
export function validateDisplayName(name: string): string | null {
  if (!name) return "이름을 입력해주세요.";
  if (name.length < DISPLAY_NAME_MIN_LENGTH || name.length > DISPLAY_NAME_MAX_LENGTH)
    return `${DISPLAY_NAME_MIN_LENGTH}~${DISPLAY_NAME_MAX_LENGTH}자로 입력해주세요.`;
  if (!DISPLAY_NAME_PATTERN.test(name)) return "영문 소문자, 숫자, 밑줄(_)만 쓸 수 있고, 첫 글자는 영문이나 숫자여야 해요.";
  if (RESERVED_DISPLAY_NAMES.has(name)) return "이미 앱에서 쓰는 주소라 사용할 수 없어요.";
  return null;
}

// 중복 확인: 나(myUid)가 아닌 다른 사용자가 이 displayName 을 쓰고 있으면 true
// users 컬렉션에서 displayName == name 인 문서를 찾는다 (공개 페이지 찾기와 같은 방식의 검색)
// limit(2): 혹시 내 문서와 다른 사람 문서가 둘 다 있으면 1개만 가져올 때 내 것만 보고 "안 겹침"으로 착각할 수 있어서
export async function isDisplayNameTaken(name: string, myUid: string): Promise<boolean> {
  const snapshot = await getDocs(query(collection(db, "users"), where("displayName", "==", name), limit(2)));
  return snapshot.docs.some((d) => d.id !== myUid);
}

// 저장할 때 이름이 이미 쓰이고 있으면 던지는 오류 (화면에서 이걸 보고 "이미 사용 중" 문구를 띄운다)
export class DisplayNameTakenError extends Error {
  constructor() {
    super("이미 사용 중인 이름이에요.");
    this.name = "DisplayNameTakenError";
  }
}

// 프로필 문서 위치: users/{uid}/profile/main
// (Firestore 경로는 컬렉션/문서/컬렉션/문서 … 순서라, profile 하위 컬렉션 안에 main 이라는 문서 하나를 둔다)
function profileDoc(uid: string) {
  return doc(db, "users", uid, "profile", "main");
}

// [프로필 수정] 폼에서 저장할 값
export type ProfileUpdate = {
  username: string; // 아이디 = 공개 페이지 주소 (users/{uid} 의 displayName)
  name: string; // 이름(실명) (users/{uid} 의 username)
  bio: string; // 한 줄 소개
};

// 마이페이지 [프로필 수정]에서 저장했을 때
// 1) 아이디가 바뀌었으면 저장 직전에 중복을 한 번 더 확인한다 (입력 중에 확인한 뒤 그 사이 누가 먼저 가져갔을 수 있으므로)
// 2) writeBatch 로 두 문서를 "한 번에" 쓴다 — 둘 다 성공하거나 둘 다 실패한다 (한쪽만 바뀌는 일이 없음)
//    - users/{uid}/profile/main : 프로필 수정 내용 저장 (요구사항의 저장 위치)
//    - users/{uid}              : 공개 페이지 찾기·중복 확인·헤더 메뉴가 읽는 문서도 같은 값으로 맞춘다
export async function updateProfile(uid: string, currentUsername: string, next: ProfileUpdate): Promise<void> {
  if (next.username !== currentUsername) {
    const formatError = validateDisplayName(next.username);
    if (formatError) throw new Error(formatError);
    if (await isDisplayNameTaken(next.username, uid)) throw new DisplayNameTakenError();
  }
  const batch = writeBatch(db); // 여러 쓰기를 모아 두는 바구니
  // merge: true → 문서가 없으면 새로 만들고, 있으면 적은 필드만 바꾼다
  batch.set(profileDoc(uid), { ...next, updatedAt: serverTimestamp() }, { merge: true });
  batch.update(userDoc(uid), { displayName: next.username, username: next.name, bio: next.bio });
  await batch.commit(); // 바구니에 담은 쓰기를 한꺼번에 실행
}
