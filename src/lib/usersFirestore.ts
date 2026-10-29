// Firestore 의 유저 프로필 문서(users/{uid})를 다루는 함수들입니다.
// 링크는 그 아래 하위 컬렉션 users/{uid}/links 에 따로 있습니다 (linksFirestore.ts).
//
//   users/
//   └── {uid}            ← 이 파일: uid · displayName · username · email · photoURL · bio
//       └── links/       ← linksFirestore.ts: 링크 문서들

import { collection, deleteField, doc, getDoc, getDocs, limit, onSnapshot, query, setDoc, updateDoc, where, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AuthUser } from "@/store/useAuthStore";

// 처음 만들 때 넣는 한 줄 소개 (사용자가 아직 소개를 안 쓴 상태)
export const DEFAULT_BIO = "한 줄 소개를 입력해주세요.";

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

// users/{uid} 문서를 실시간으로 지켜본다 (onSnapshot)
// 문서가 바뀔 때마다(처음 만들어질 때 포함) onChange 가 새 값으로 불린다. 문서가 아직 없으면 null
// 돌려주는 함수(Unsubscribe)를 부르면 지켜보기를 멈춘다 — 화면을 떠날 때 꼭 불러야 한다
export function subscribeUserProfile(
  uid: string,
  onChange: (profile: UserProfile | null) => void,
  onError: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    userDoc(uid),
    (snapshot) => {
      const data = snapshot.data();
      onChange(data ? toProfile(data) : null);
    },
    onError,
  );
}

// 마이페이지에서 한 줄 소개를 고쳤을 때: users/{uid} 문서의 bio 필드만 바꾼다
// 바꾸면 onSnapshot 으로 지켜보는 화면(마이페이지·프로필 메뉴)이 저절로 새 소개로 다시 그려진다
export async function updateBio(uid: string, bio: string): Promise<void> {
  await updateDoc(userDoc(uid), { bio });
}
