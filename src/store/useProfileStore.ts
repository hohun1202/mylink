// 전역 상태 저장소(Zustand 스토어)입니다.
// 여러 화면이 같은 데이터를 보도록 한곳에 둡니다. 두 가지를 따로 들고 있습니다.
// 1) profiles — 공개 페이지(/<핸들>)에 보이는 샘플 프로필. persist 미들웨어로 LocalStorage 에 자동 저장·복원합니다.
// 2) myLinks — 로그인한 사용자의 링크. Firestore(users/{uid}/links)에서 불러오며, LocalStorage 에는 저장하지 않습니다.
//    (같은 브라우저에서 다른 계정으로 로그인했을 때 이전 계정 링크가 남아 보이지 않게 하려고)
// 링크 추가는 Firestore 에 먼저 저장한 뒤(useLinkForm), 그 결과를 myLinks 에도 반영합니다.
// 링크 수정·삭제는 Firestore 에 먼저 반영한 뒤, 목록을 Firestore 에서 다시 불러와 바꿉니다(reloadMyLinks · 갱신형).

import { useEffect } from "react";
import { create } from "zustand"; // 스토어를 만드는 함수
import { persist, createJSONStorage } from "zustand/middleware"; // LocalStorage 연동 도구
import type { Link, Profile } from "@/lib/types"; // 링크·프로필 데이터 모양
import { MOCK_PROFILES } from "@/lib/mockData"; // 처음 넣어 줄 샘플 데이터
import { fetchLinks } from "@/lib/linksFirestore"; // Firestore 불러오기 함수

// 스토어에 들어 있는 값과 동작의 모양
type ProfileState = {
  profiles: Profile[]; // 저장된 모든 샘플 프로필 (공개 페이지용)
  hasHydrated: boolean; // LocalStorage에서 불러오기를 끝냈는지 (저장하지 않음)
  myLinks: Link[]; // 로그인한 사용자의 링크 (저장하지 않음)
  myLinksUid: string | null; // myLinks 가 어느 계정(uid)의 링크인지. 아직 한 번도 못 불러왔으면 null
  myLinksLoading: boolean; // Firestore 에서 내 링크를 불러오는 중인지 (로딩 표시용)
  addMyLink: (link: Link) => void; // 링크를 목록 맨 앞에 추가 (최신순이므로) (F5)
  setMyLinks: (uid: string, links: Link[]) => void; // 내 링크 목록을 통째로 바꿈 (Firestore 에서 불러온 값으로)
  clearMyLinks: () => void; // 로그아웃·계정 전환 때 이전 계정 링크를 비움
};

export const useProfileStore = create<ProfileState>()(
  persist(
    // set: 스토어 값을 바꾸는 함수. 바꾸면 persist 가 LocalStorage에도 자동 저장한다
    (set): ProfileState => ({
      profiles: MOCK_PROFILES, // LocalStorage가 비어 있으면 이 값이 쓰이고 곧바로 저장됨
      hasHydrated: false,
      myLinks: [],
      myLinksUid: null,
      myLinksLoading: false,
      // 새 링크는 맨 앞에 붙인다 (목록이 createdAt 최신순이므로). id는 Firestore 문서 id
      addMyLink: (link) => set((state) => ({ myLinks: [link, ...state.myLinks] })),
      setMyLinks: (uid, links) => set({ myLinks: links, myLinksUid: uid }),
      clearMyLinks: () => set({ myLinks: [], myLinksUid: null }),
    }),
    {
      name: "mylink:profiles", // LocalStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 객체 ↔ 문자열(JSON)로 바꿔 LocalStorage에 저장
      partialize: (state) => ({ profiles: state.profiles }), // profiles만 저장 (hasHydrated·myLinks·함수는 저장하지 않음)
      // 서버에는 LocalStorage가 없으므로 자동 복원을 끄고,
      // 브라우저에서 화면이 뜬 뒤 직접 복원한다 (하이드레이션 오류 방지 · PRD 5.1)
      skipHydration: true,
      // 복원이 끝나면 hasHydrated를 true로 바꿔 화면이 데이터를 그리게 한다
      onRehydrateStorage: () => () => {
        useProfileStore.setState({ hasHydrated: true });
      },
    },
  ),
);

// 스토어를 읽는 화면이 맨 처음 부르는 훅: 브라우저에서 LocalStorage 복원을 시작하고, 끝났는지를 돌려준다
export function useStoreHydration(): boolean {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  useEffect(() => {
    // 다른 화면에서 이미 복원했으면 다시 읽지 않는다
    if (!useProfileStore.persist.hasHydrated()) useProfileStore.persist.rehydrate();
  }, []);
  return hasHydrated;
}

// 로그인한 사용자의 링크를 Firestore(users/{uid}/links)에서 불러와 myLinks 에 넣는 훅
// uid 가 바뀌면(다른 계정으로 로그인) 그 계정의 링크를 새로 불러온다
// 돌려주는 값: 지금 불러오는 중인지 (화면에 로딩 표시를 띄울 때 씀)
export function useMyLinks(uid: string): boolean {
  const myLinksUid = useProfileStore((s) => s.myLinksUid);
  const myLinksLoading = useProfileStore((s) => s.myLinksLoading);
  useEffect(() => {
    let cancelled = false; // 불러오는 사이에 화면을 떠났거나 계정이 바뀌었으면 결과를 버리기 위한 표시
    useProfileStore.setState({ myLinksLoading: true }); // 로딩 표시 켜기
    fetchLinks(uid)
      .then((links) => {
        if (!cancelled) useProfileStore.getState().setMyLinks(uid, links);
      })
      .catch((err) => {
        // 실패하면 빈 목록으로 둔다. 원인(권한 규칙, 네트워크 등)은 콘솔에서 확인
        console.error("링크 불러오기 실패:", err);
        if (!cancelled) useProfileStore.getState().setMyLinks(uid, []);
      })
      // 성공하든 실패하든 끝나면 로딩 표시 끄기
      .finally(() => {
        if (!cancelled) useProfileStore.setState({ myLinksLoading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);
  // 이 계정 링크를 아직 한 번도 못 받았으면 "링크가 없어요" 대신 로딩으로 보여준다
  return myLinksLoading || myLinksUid !== uid;
}

// 링크를 수정·삭제한 직후 부르는 함수: Firestore 에서 목록을 다시 불러와 myLinks 를 통째로 바꾼다 (갱신형)
// 실시간 구독(onSnapshot)이 아니라, 저장이 끝난 순간에 한 번만 다시 읽어 온다
export async function reloadMyLinks(uid: string): Promise<void> {
  const links = await fetchLinks(uid);
  useProfileStore.getState().setMyLinks(uid, links);
}
