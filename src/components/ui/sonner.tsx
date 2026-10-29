"use client"; // 토스트는 브라우저에서만 뜨므로 클라이언트 컴포넌트

// 토스트(잠깐 떴다 사라지는 알림) 표시 자리입니다. layout.tsx 에 한 번만 넣습니다.
// 어디서든 `import { toast } from "sonner"` 후 toast.success("…") / toast.error("…") / toast.warning("…") 로 띄웁니다.
// sonner 는 Radix 를 쓰지 않는 독립 라이브러리입니다. (shadcn 의 sonner 래퍼는 next-themes 가 필요해서 쓰지 않고 직접 만듦)
//
// 가독성: 연한 색 배경(richColors) 대신 흰 바탕 + 진한 글자로 대비를 높이고,
//         성공·실패·경고는 왼쪽 굵은 색 막대와 아이콘 색으로 구분한다.
// 클래스 앞의 ! 는 sonner 기본 스타일보다 우선 적용하라는 뜻 (Tailwind important)

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center" // 화면 위 가운데
      offset={68} // 헤더(높이 56px) 바로 아래에 뜨도록
      closeButton // ✕ 로 바로 닫기
      duration={3000} // 3초 뒤 저절로 사라짐 (읽을 시간 확보)
      toastOptions={{
        classNames: {
          // 흰 바탕 + 진한 글자 + 굵은 테두리 + 각진 그림자 (design.md)
          toast:
            "!w-[min(92vw,380px)] !gap-3 !rounded-sm !border-2 !border-carbon !bg-popover !px-4 !py-3.5 !text-carbon !shadow-hard",
          title: "!text-[15px] !leading-snug !font-bold", // 본문: 15px 굵게
          description: "!mt-0.5 !text-[13px] !leading-snug !font-medium !text-carbon/80 break-all", // 설명: 흐리지 않게
          icon: "!size-5", // 아이콘 크게
          closeButton: "!border-carbon !bg-popover !text-carbon",
          // 종류별: 왼쪽 굵은 색 막대 + 아이콘 색
          success: "!border-l-8 !border-l-green-600 [&_[data-icon]]:!text-green-600",
          error: "!border-l-8 !border-l-red-600 [&_[data-icon]]:!text-red-600",
          warning: "!border-l-8 !border-l-amber-500 [&_[data-icon]]:!text-amber-600",
          info: "!border-l-8 !border-l-blue-600 [&_[data-icon]]:!text-blue-600",
        },
      }}
      {...props}
    />
  );
}
