// Firebase 연결 설정 파일입니다.
// 앱 어디서든 `import { db, auth } from "@/lib/firebase"` 로 Firestore·로그인(Auth)을 꺼내 쓰면 됩니다.
// 설정값은 코드에 직접 쓰지 않고 .env.local 의 환경 변수에서 읽어 옵니다.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Firebase 콘솔에서 복사한 firebaseConfig 와 같은 내용입니다.
// NEXT_PUBLIC_ 으로 시작하는 변수는 빌드할 때 값이 코드에 끼워 넣어져 브라우저에서도 쓸 수 있습니다.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase 앱은 한 번만 만들어야 합니다.
// 개발 서버는 코드를 고칠 때마다 이 파일을 다시 실행하므로,
// 이미 만들어진 앱이 있으면(getApps().length > 0) 새로 만들지 않고 그걸 다시 씁니다.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore 데이터베이스 연결 — 링크 저장·불러오기에 이걸 씁니다.
export const db = getFirestore(app);

// Firebase Auth(로그인) 연결 — 구글 로그인·로그아웃·로그인 상태 감지에 이걸 씁니다.
// 로그인 상태는 Firebase 가 브라우저(IndexedDB)에 저장해 두므로, 새로고침해도 로그인이 유지됩니다.
export const auth = getAuth(app);

// 구글 로그인 제공자 — "Google로 로그인" 팝업을 띄울 때 signInWithPopup(auth, googleProvider) 로 씁니다.
export const googleProvider = new GoogleAuthProvider();

// Analytics(방문 통계)는 브라우저에서만 동작합니다.
// 서버에서 그냥 getAnalytics() 를 부르면 오류가 나므로,
// 브라우저이고 지원되는 환경일 때만 켜고, 아니면 null 을 돌려줍니다.
export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null; // 서버에서 실행 중이면 건너뜀
  return (await isSupported()) ? getAnalytics(app) : null;
}
