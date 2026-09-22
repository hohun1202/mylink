// LocalStorage에서 데이터를 불러오는 동안 보여주는 자리표시 화면입니다. (PRD 5.1 하이드레이션)
// 실제 화면(아바타·이름·소개·링크 버튼)과 같은 자리에 회색 상자를 깔아, 로딩 후 화면이 덜 흔들리게 합니다.

import { Skeleton } from "@/components/ui/skeleton"; // shadcn 로딩 상자

export default function ProfileSkeleton() {
  return (
    <div className="flex w-full flex-col items-center" role="status" aria-label="불러오는 중">
      <Skeleton className="size-24 rounded-full" /> {/* 아바타 자리 */}
      <Skeleton className="mt-4 h-7 w-40" /> {/* 이름 자리 */}
      <Skeleton className="mt-2 h-4 w-56" /> {/* 소개 자리 */}
      <div className="mt-8 flex w-full flex-col gap-3">
        {/* 링크 버튼 자리 3개 (key는 목록 구분용 번호) */}
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}
