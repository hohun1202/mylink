// 전역 상태 저장소(Zustand 스토어)입니다.
// profiles — 공개 페이지(/<핸들>)에 보이는 샘플 프로필. persist 미들웨어로 LocalStorage 에 자동 저장·복원합니다.
// (로그인한 사용자의 링크·프로필은 Firestore 데이터라 여기 두지 않고 TanStack Query 캐시가 관리합니다 · src/lib/queries.ts)

import { useEffect } from "react";
import { create } from "zustand"; // 스토어를 만드는 함수
import { persist, createJSONStorage } from "zustand/middleware"; // LocalStorage 연동 도구
import type { Profile } from "@/lib/types"; // 프로필 데이터 모양
import { MOCK_PROFILES } from "@/lib/mockData"; // 처음 넣어 줄 샘플 데이터

// 스토어에 들어 있는 값과 동작의 모양
type ProfileState = {
  profiles: Profile[]; // 저장된 모든 샘플 프로필 (공개 페이지용)
  hasHydrated: boolean; // LocalStorage에서 불러오기를 끝냈는지 (저장하지 않음)
};

export const useProfileStore = create<ProfileState>()(
  persist(
    // 처음 값. 값이 바뀌면 persist 가 LocalStorage에도 자동 저장한다
    (): ProfileState => ({
      profiles: MOCK_PROFILES, // LocalStorage가 비어 있으면 이 값이 쓰이고 곧바로 저장됨
      hasHydrated: false,
    }),
    {
      name: "mylink:profiles", // LocalStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 객체 ↔ 문자열(JSON)로 바꿔 LocalStorage에 저장
      partialize: (state) => ({ profiles: state.profiles }), // profiles만 저장 (hasHydrated·함수는 저장하지 않음)
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
