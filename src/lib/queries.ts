"use client";

// Firestore 데이터를 TanStack Query 로 가져오고(useQuery) 바꾸는(useMutation) 훅을 한곳에 모은 파일입니다.
//
// ▸ 실시간 기능은 쓰지 않습니다. 데이터를 다시 가져오는 때는 딱 두 번입니다.
//   1) 그 데이터를 처음 화면에 띄울 때
//   2) 우리가 추가·수정·삭제한 직후 — invalidateQueries("이 데이터 오래됐어")로 알리면 다시 가져온다
//
// ▸ 쿼리 키(queryKey) = 캐시 창고의 "선반 이름". 같은 키를 쓰는 화면끼리 데이터를 나눠 쓴다.
//   uid 를 키에 넣었기 때문에 계정이 바뀌면 선반도 달라져, 이전 계정 데이터가 섞여 보이지 않는다.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteLink, fetchLinks, saveLink, updateLink } from "@/lib/linksFirestore";
import type { LinkInput } from "@/lib/validateLink";
import { fetchPublicPage, type PublicPage } from "@/lib/publicPage"; // 공개 페이지 = 사용자 찾기 + 링크
import {
  fetchUserProfile,
  updateProfile,
  type ProfileUpdate,
  type UserProfile,
} from "@/lib/usersFirestore";

// ───────── 쿼리 키 ─────────
export const queryKeys = {
  links: (uid: string) => ["links", uid] as const, // 내 링크 목록 (users/{uid}/links)
  profile: (uid: string) => ["profile", uid] as const, // 내 프로필 (users/{uid})
  publicPageAll: ["publicPage"] as const, // 공개 페이지 전체 (한꺼번에 오래됨 표시할 때)
  publicPage: (displayName: string) => ["publicPage", displayName] as const, // /{displayName} 공개 페이지 (프로필 + 링크)
};

// ───────── 가져오기 (useQuery) ─────────

// 내 링크 목록. uid 가 없으면(로그아웃) 가져오지 않는다
export function useLinksQuery(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.links(uid ?? ""),
    queryFn: () => fetchLinks(uid!),
    enabled: !!uid,
  });
}

// 내 프로필 (users/{uid} 문서를 한 번 읽음). 문서가 아직 없으면 data 는 null
export function useProfileQuery(uid: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile(uid ?? ""),
    queryFn: () => fetchUserProfile(uid!),
    enabled: !!uid,
  });
}

// 공개 페이지 /{displayName}: displayName 이 같은 사용자와 그 사람의 링크(users/{uid}/links). 없으면 null
// initialData: 서버(page.tsx)가 404 판단하면서 이미 가져온 값. 있으면 브라우저는 처음에 다시 묻지 않고 그걸로 바로 그린다
// (undefined 면 평소처럼 브라우저에서 가져온다 — 서버에서 읽기에 실패한 경우 등)
export function usePublicPageQuery(displayName: string, initialData?: PublicPage | null) {
  return useQuery({
    queryKey: queryKeys.publicPage(displayName),
    queryFn: () => fetchPublicPage(displayName),
    initialData,
  });
}

// ───────── 바꾸기 (useMutation) ─────────
// onSuccess 에서 invalidateQueries 를 return 하면, 목록을 다시 가져올 때까지 isPending 이 true 로 남는다
// → [저장] 버튼의 스피너가 "목록이 새로 그려질 때"까지 돈다

// 링크 추가 → 성공하면 내 링크 목록과 공개 페이지를 다시 가져온다
export function useAddLinkMutation(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (link: LinkInput) => saveLink(uid, link),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.links(uid) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.publicPageAll }),
      ]),
  });
}

// 링크 수정
export function useUpdateLinkMutation(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, link }: { id: string; link: LinkInput }) => updateLink(uid, id, link),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.links(uid) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.publicPageAll }),
      ]),
  });
}

// 링크 삭제
export function useDeleteLinkMutation(uid: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLink(uid, id),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.links(uid) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.publicPageAll }),
      ]),
  });
}

// 프로필 수정 — ⭐ 낙관적 업데이트(optimistic update)
// "저장이 성공할 거라고 믿고(낙관), 서버 응답을 기다리지 않고 화면부터 바꾼다"
//   1) onMutate : 저장을 보내기 직전. 지금 캐시 값을 따로 챙겨 두고(되돌리기용), 캐시를 새 값으로 바꾼다 → 화면이 즉시 바뀜
//   2) mutationFn: 실제로 Firestore 에 저장
//   3) onError  : 저장이 실패하면 챙겨 둔 예전 값으로 캐시를 되돌린다 → 화면도 원래대로
//   4) onSettled: 성공이든 실패든 끝나면 서버 값을 다시 가져와 캐시를 진짜 값으로 맞춘다
export function useUpdateProfileMutation(uid: string) {
  const queryClient = useQueryClient();
  const key = queryKeys.profile(uid);
  return useMutation({
    mutationFn: (next: ProfileUpdate) => updateProfile(uid, next),

    onMutate: async (next) => {
      // 마침 프로필을 가져오는 중이었다면 멈춘다 (늦게 온 옛 값이 방금 바꾼 화면을 덮어쓰지 않게)
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<UserProfile | null>(key); // 되돌리기용 예전 값
      // 캐시를 새 값으로 바꾼다. users/{uid} 필드 이름에 맞춰 넣는다 (이름 → username)
      queryClient.setQueryData<UserProfile | null>(key, (old) => (old ? { ...old, username: next.name, bio: next.bio } : old));
      return { previous }; // onError 에서 context.previous 로 받는다
    },

    onError: (_err, _vars, context) => {
      // 실패 → 예전 값으로 되돌리기
      if (context) queryClient.setQueryData(key, context.previous);
    },

    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: key }), // 서버의 진짜 값으로 맞추기
        queryClient.invalidateQueries({ queryKey: queryKeys.publicPageAll }), // 공개 페이지의 소개가 바뀌었을 수 있음
      ]),
  });
}
