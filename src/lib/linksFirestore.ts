// Firestore 에 링크를 저장하고 불러오는 함수들을 모아 둔 파일입니다.
// 저장 위치: users/anonymous/links (로그인 기능이 생기기 전까지는 모든 링크를 "anonymous" 사용자 아래에 둠)

import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { LinkInput } from "@/lib/validateLink"; // 검사를 통과한 링크 입력값 모양
import type { Link } from "@/lib/types"; // 화면에서 쓰는 링크 모양

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

// 저장된 링크를 모두 불러온다. createdAt 기준 최신순(가장 최근에 만든 링크가 맨 앞)
export async function fetchLinks(): Promise<Link[]> {
  // orderBy("createdAt", "desc"): 만든 시각이 큰(= 최근) 것부터 정렬해서 달라고 요청
  const snapshot = await getDocs(query(linksCollection, orderBy("createdAt", "desc")));
  // 문서 하나하나를 화면용 Link 모양으로 바꾼다. id 는 Firestore 문서 id 를 그대로 쓴다
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    url: doc.data().url,
    // Firestore 의 시각(Timestamp)은 LocalStorage 에 그대로 저장할 수 없어 밀리초 숫자로 바꾼다
    // 옛 문서처럼 updatedAt 이 없으면 undefined
    updatedAt: doc.data().updatedAt?.toMillis(),
  }));
}

// 이미 저장된 링크 하나의 제목·주소를 고친다. (추가할 때와 같은 경로 users/anonymous/links/<문서 id>)
// createdAt 은 그대로 두어 목록 순서가 바뀌지 않고, updatedAt 만 고친 시각으로 바뀐다
export async function updateLink(id: string, link: LinkInput): Promise<void> {
  await updateDoc(doc(linksCollection, id), {
    title: link.title,
    url: link.url,
    updatedAt: serverTimestamp(),
  });
}

// 링크 하나를 Firestore 에서 지운다 (같은 경로의 문서를 삭제)
export async function deleteLink(id: string): Promise<void> {
  await deleteDoc(doc(linksCollection, id));
}
