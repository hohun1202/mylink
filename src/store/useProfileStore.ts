// 전역 상태 저장소(Zustand 스토어)입니다.
// 여러 화면이 같은 프로필 데이터를 보도록 한곳에 두고,
// persist 미들웨어로 LocalStorage에 자동 저장·복원합니다.
// 서버가 없으므로 링크 추가 같은 변경도 모두 여기(로컬 상태)에서 처리합니다.

import { useEffect } from "react";
import { create } from "zustand"; // 스토어를 만드는 함수
import { persist, createJSONStorage } from "zustand/middleware"; // LocalStorage 연동 도구
import type { LinkInput } from "@/lib/validateLink"; // 검사를 통과한 링크 입력값 모양
import type { Profile } from "@/lib/types"; // 프로필 데이터 모양
import { MOCK_PROFILES } from "@/lib/mockData"; // 처음 넣어 줄 샘플 데이터

// "내 페이지" 핸들은 src/lib/me.ts 에 있다. 기존 화면들이 여기서 가져다 쓰므로 그대로 다시 내보낸다
export { MY_HANDLE } from "@/lib/me";

// 스토어에 들어 있는 값과 동작의 모양
type ProfileState = {
  profiles: Profile[]; // 저장된 모든 프로필
  hasHydrated: boolean; // LocalStorage에서 불러오기를 끝냈는지 (저장하지 않음)
  addLink: (handle: string, link: LinkInput) => void; // 링크를 목록 맨 끝에 추가 (F5)
  removeLink: (handle: string, linkId: string) => void; // 링크 하나 삭제 (F5 · 시나리오 B-4)
};

export const useProfileStore = create<ProfileState>()(
  persist(
    // set: 스토어 값을 바꾸는 함수. 바꾸면 persist 가 LocalStorage에도 자동 저장한다
    (set): ProfileState => ({
      profiles: MOCK_PROFILES, // LocalStorage가 비어 있으면 이 값이 쓰이고 곧바로 저장됨
      hasHydrated: false,
      addLink: (handle, link) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.handle === handle
              ? // 새 링크는 맨 끝에 붙인다 (배열 순서 = 화면 순서). id는 브라우저가 만들어 주는 고유 문자열
                { ...p, links: [...p.links, { id: crypto.randomUUID(), ...link }] }
              : p,
          ),
        })),
      removeLink: (handle, linkId) =>
        set((state) => ({
          profiles: state.profiles.map((p) =>
            // 해당 프로필에서 id가 같은 링크만 빼고 나머지는 순서 그대로 남긴다
            p.handle === handle ? { ...p, links: p.links.filter((l) => l.id !== linkId) } : p,
          ),
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
