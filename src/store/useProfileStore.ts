// 전역 상태 저장소(Zustand 스토어)입니다.
// 여러 화면이 같은 프로필 데이터를 보도록 한곳에 두고,
// persist 미들웨어로 LocalStorage에 자동 저장·복원합니다.
// 링크 추가는 Firestore 에 먼저 저장한 뒤(useLinkForm), 그 결과를 여기(로컬 상태)에도 반영합니다.
// 페이지가 열리면 Firestore 에 저장된 내 링크를 불러와 로컬 목록을 그걸로 바꿉니다(useFirestoreLinks).
// 링크 수정·삭제는 Firestore 에 먼저 반영한 뒤, 목록을 Firestore 에서 다시 불러와 바꿉니다(reloadLinks · 갱신형).

import { useEffect } from "react";
import { create } from "zustand"; // 스토어를 만드는 함수
import { persist, createJSONStorage } from "zustand/middleware"; // LocalStorage 연동 도구
import type { Link, Profile } from "@/lib/types"; // 링크·프로필 데이터 모양
import { MOCK_PROFILES } from "@/lib/mockData"; // 처음 넣어 줄 샘플 데이터
import { fetchLinks } from "@/lib/linksFirestore"; // Firestore 불러오기 함수
import { MY_HANDLE } from "@/lib/me";

// "내 페이지" 핸들은 src/lib/me.ts 에 있다. 기존 화면들이 여기서 가져다 쓰므로 그대로 다시 내보낸다
export { MY_HANDLE } from "@/lib/me";

// 스토어에 들어 있는 값과 동작의 모양
type ProfileState = {
  profiles: Profile[]; // 저장된 모든 프로필
  hasHydrated: boolean; // LocalStorage에서 불러오기를 끝냈는지 (저장하지 않음)
  linksLoading: boolean; // Firestore 에서 링크를 불러오는 중인지 (로딩 표시용 · 저장하지 않음)
  addLink: (handle: string, link: Link) => void; // 링크를 목록 맨 앞에 추가 (최신순이므로) (F5)
  setLinks: (handle: string, links: Link[]) => void; // 링크 목록을 통째로 바꿈 (Firestore 에서 불러온 값으로)
};

export const useProfileStore = create<ProfileState>()(
  persist(
    // set: 스토어 값을 바꾸는 함수. 바꾸면 persist 가 LocalStorage에도 자동 저장한다
    (set): ProfileState => ({
      profiles: MOCK_PROFILES, // LocalStorage가 비어 있으면 이 값이 쓰이고 곧바로 저장됨
      hasHydrated: false,
      linksLoading: false,
      addLink: (handle, link) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.handle === handle
              ? // 새 링크는 맨 앞에 붙인다 (목록이 createdAt 최신순이므로). id는 Firestore 문서 id
                { ...p, links: [link, ...p.links] }
              : p,
          ),
        })),
      setLinks: (handle, links) =>
        set((state) => ({
          profiles: state.profiles.map((p) => (p.handle === handle ? { ...p, links } : p)),
        })),
    }),
    {
      name: "mylink:profiles", // LocalStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 객체 ↔ 문자열(JSON)로 바꿔 LocalStorage에 저장
      partialize: (state) => ({ profiles: state.profiles }), // hasHydrated·함수는 저장하지 않고 profiles만 저장
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

// 내 페이지가 열릴 때 Firestore(users/anonymous/links)에서 링크를 불러와 로컬 목록을 바꾸는 훅
// handle 이 내 핸들이 아니면 아무것도 하지 않는다 (Firestore 에는 아직 내 링크만 있으므로)
// 돌려주는 값: 지금 불러오는 중인지 (화면에 로딩 표시를 띄울 때 씀)
export function useFirestoreLinks(handle: string): boolean {
  const hasHydrated = useProfileStore((s) => s.hasHydrated);
  const linksLoading = useProfileStore((s) => s.linksLoading);
  const setLinks = useProfileStore((s) => s.setLinks);
  useEffect(() => {
    // LocalStorage 복원이 끝난 뒤에 불러와야, 복원이 Firestore 값을 옛 값으로 덮어쓰지 않는다
    if (!hasHydrated || handle !== MY_HANDLE) return;
    let cancelled = false; // 불러오는 사이에 화면을 떠났으면 결과를 버리기 위한 표시
    useProfileStore.setState({ linksLoading: true }); // 로딩 표시 켜기
    fetchLinks()
      .then((links) => {
        if (!cancelled) setLinks(handle, links);
      })
      .catch((err) => {
        // 실패하면 LocalStorage 에 있던 목록을 그대로 보여준다. 원인(권한 규칙, 네트워크 등)은 콘솔에서 확인
        console.error("링크 불러오기 실패:", err);
      })
      // 성공하든 실패하든 끝나면 로딩 표시 끄기
      .finally(() => useProfileStore.setState({ linksLoading: false }));
    return () => {
      cancelled = true;
    };
  }, [hasHydrated, handle, setLinks]);
  return handle === MY_HANDLE && linksLoading; // 남의 페이지에서는 로딩 표시를 띄우지 않는다
}

// 링크를 수정·삭제한 직후 부르는 함수: Firestore 에서 목록을 다시 불러와 로컬 목록을 통째로 바꾼다 (갱신형)
// 실시간 구독(onSnapshot)이 아니라, 저장이 끝난 순간에 한 번만 다시 읽어 온다
export async function reloadLinks(handle: string): Promise<void> {
  const links = await fetchLinks();
  useProfileStore.getState().setLinks(handle, links);
}
