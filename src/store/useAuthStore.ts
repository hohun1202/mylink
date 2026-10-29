// 로그인 상태 저장소(Zustand 스토어)입니다.
// 헤더·내 페이지·대시보드가 모두 "지금 누가 로그인했는지"를 알아야 하므로 한곳에 둡니다.
// 로그인 상태는 Firebase 가 브라우저에 직접 저장하므로, 이 스토어는 LocalStorage 에 따로 저장하지 않습니다.

import { useEffect } from "react";
import { create } from "zustand";
import { toast } from "sonner"; // 잠깐 떴다 사라지는 알림
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { ensureUserProfile } from "@/lib/usersFirestore"; // 처음 로그인한 사용자의 users/{uid} 문서 만들기
import { useProfileStore } from "@/store/useProfileStore";

// 화면에 보여줄 로그인 사용자 정보 (Firebase User 에서 필요한 것만 골라 담음)
export type AuthUser = {
  uid: string; // 계정 고유 번호 — Firestore 경로 users/{uid}/links 의 키
  name: string; // 표시 이름 = 이메일의 @ 앞부분 (예: hohun1202@gmail.com → hohun1202). 이메일이 없으면 구글 계정 이름
  email: string | null; // 구글 이메일
  photoURL: string | null; // 구글 프로필 사진 주소
  username: string | null; // 구글 계정 실명 (예: 장호현). Firestore 문서의 username 필드로 저장
};

type AuthState = {
  user: AuthUser | null; // 로그인한 사용자 (로그아웃 상태면 null)
  authReady: boolean; // Firebase 가 "로그인했는지 아닌지"를 처음으로 알려 줬는지
  signingIn: boolean; // 구글 팝업이 떠 있는 중인지 (버튼 잠금용)
};

export const useAuthStore = create<AuthState>()(() => ({
  user: null,
  authReady: false, // 처음에는 모른다 → 그동안 로그인 버튼 대신 자리표시를 보여준다
  signingIn: false,
}));

// onAuthStateChanged 구독을 앱 전체에서 한 번만 시작하기 위한 표시
let listening = false;

// 로그인 상태 감지를 시작하는 훅. 모든 페이지에 있는 헤더(Header)가 부른다
// onAuthStateChanged: 로그인·로그아웃할 때마다, 그리고 페이지를 처음 열었을 때 한 번 Firebase 가 불러 주는 함수
export function useAuthListener(): void {
  useEffect(() => {
    if (listening) return;
    listening = true;
    onAuthStateChanged(auth, (firebaseUser) => {
      const prevUid = useAuthStore.getState().user?.uid;
      const user: AuthUser | null = firebaseUser
        ? {
            uid: firebaseUser.uid,
            // 표시 이름은 구글 계정 이름이 아니라 이메일 앞부분을 쓴다
            name: firebaseUser.email?.split("@")[0] || firebaseUser.displayName || "사용자",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            username: firebaseUser.displayName,
          }
        : null;
      // 계정이 바뀌었거나 로그아웃했으면, 화면에 남아 있던 이전 계정의 링크를 지운다 (데이터 분리)
      if (prevUid !== user?.uid) useProfileStore.getState().clearMyLinks();
      useAuthStore.setState({ user, authReady: true });
      // 로그인했으면 Firestore 에 users/{uid} 문서가 있는지 보고, 없으면(첫 로그인) 만들고 옛 모양이면 고친다
      if (user) {
        ensureUserProfile(user).catch((err) => console.error("유저 정보 저장 실패:", err));
      }
    });
  }, []);
}

// "Google로 로그인" 버튼을 눌렀을 때: 구글 로그인 팝업을 띄운다
// 성공하면 onAuthStateChanged 가 불려 user 가 채워지고, 화면이 저절로 로그인 상태로 바뀐다
export async function signInWithGoogle(): Promise<void> {
  if (useAuthStore.getState().signingIn) return; // 팝업이 이미 떠 있으면 무시
  useAuthStore.setState({ signingIn: true });
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // 환영 인사는 버튼으로 로그인했을 때만 (새로고침으로 로그인이 복원될 때는 띄우지 않는다)
    const name = result.user.email?.split("@")[0] || result.user.displayName || "사용자";
    toast.success(`${name}님, 환영해요`);
  } catch (err) {
    const code = (err as { code?: string }).code;
    // 사용자가 팝업을 그냥 닫은 경우는 실패가 아니므로 문구를 띄우지 않는다
    if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
      console.error("구글 로그인 실패:", err); // 원인(콘솔에서 구글 로그인 미사용, 승인되지 않은 도메인 등)은 개발자 도구 콘솔에서 확인
      toast.error(
        code === "auth/popup-blocked"
          ? "브라우저가 로그인 팝업을 막았어요. 팝업을 허용한 뒤 다시 눌러 주세요."
          : "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.",
      );
    }
  } finally {
    useAuthStore.setState({ signingIn: false });
  }
}

// "로그아웃" 버튼을 눌렀을 때. 끝나면 onAuthStateChanged 가 null 로 불려 화면이 로그아웃 상태로 바뀐다
export async function signOutUser(): Promise<void> {
  await signOut(auth);
  toast.success("로그아웃했어요");
}
