// Firestore 에 링크를 저장하는 함수들을 모아 둔 파일입니다.
// 저장 위치: users/anonymous/links (로그인 기능이 생기기 전까지는 모든 링크를 "anonymous" 사용자 아래에 둠)

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LinkInput } from "@/lib/validateLink"; // 검사를 통과한 링크 입력값 모양

// users 컬렉션 → anonymous 문서 → links 하위 컬렉션
const linksCollection = collection(db, "users", "anonymous", "links");

// 링크 하나를 새 문서로 저장하고, Firestore 가 만들어 준 문서 id 를 돌려준다
export async function saveLink(link: LinkInput): Promise<string> {
  const ref = await addDoc(linksCollection, {
    title: link.title,
    url: link.url,
    // serverTimestamp(): 브라우저 시계가 아니라 Firestore 서버가 저장하는 순간의 시각을 넣는다
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(), // 처음 만들 때는 만든 시각과 같다
  });
  return ref.id;
}
