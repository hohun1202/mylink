// 전역 상태 저장소(Zustand 스토어)입니다.
// 여러 화면이 같은 프로필 데이터를 보도록 한곳에 두고,
// persist 미들웨어로 LocalStorage에 자동 저장·복원합니다.

import { create } from "zustand"; // 스토어를 만드는 함수
import { persist, createJSONStorage } from "zustand/middleware"; // LocalStorage 연동 도구
import type { Profile } from "@/lib/types"; // 프로필 데이터 모양
import { MOCK_PROFILES } from "@/lib/mockData"; // 처음 넣어 줄 샘플 데이터

// 스토어에 들어 있는 값의 모양
type ProfileState = {
  profiles: Profile[]; // 저장된 모든 프로필
  hasHydrated: boolean; // LocalStorage에서 불러오기를 끝냈는지 (저장하지 않음)
};

export const useProfileStore = create<ProfileState>()(
  persist(
    // 스토어의 초기값: LocalStorage가 비어 있으면 이 값이 쓰이고 곧바로 저장됨
    (): ProfileState => ({
      profiles: MOCK_PROFILES,
      hasHydrated: false,
    }),
    {
      name: "mylink:profiles", // LocalStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // 객체 ↔ 문자열(JSON)로 바꿔 LocalStorage에 저장
      partialize: (state) => ({ profiles: state.profiles }), // hasHydrated는 저장하지 않고 profiles만 저장
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
