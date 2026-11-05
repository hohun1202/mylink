"use client"; // 글자가 한 자씩 써지는 효과(타이머·상태)를 쓰므로 클라이언트 컴포넌트

// 랜딩 페이지 오른쪽(휴대폰에서는 위)에 놓는 "완성된 mylink 페이지 미리보기" 휴대폰 모형입니다.
// - 맨 위 주소창: 예시 아이디가 한 글자씩 써졌다 지워지며 바뀐다 (타자 치는 효과)
// - 가운데: 예시 프로필(아바타 · 이름 · 한 줄 소개)
// - 아래: 예시 링크 줄 5개가 차례로 떠오르고, 마우스를 올리면 "+1 클릭" 배지가 튀어 오른다 (통계 기능 맛보기)
// 진짜 링크가 아니라 그림이므로 <a> 대신 <div> 로 그린다 (눌러도 아무 데도 가지 않음).

import { useEffect, useState } from "react";
import { ChevronRight, Lock } from "lucide-react";
import LinkIcon from "@/components/link/LinkIcon"; // 진짜 링크 버튼과 같은 아이콘 칸 (주소에 맞는 로고)

// 주소창에 번갈아 써 볼 예시 아이디들 (실제 사용자 아님)
const SAMPLE_HANDLES = ["dev-kim", "frontend-lee", "coder-park"];

// 미리보기 안의 예시 링크들. url 은 아이콘 모양을 고르는 데만 쓴다
const SAMPLE_LINKS = [
  { title: "GitHub — 내 코드 저장소", url: "https://github.com" },
  { title: "기술 블로그 (velog)", url: "https://velog.io" },
  { title: "YouTube 코딩 브이로그", url: "https://youtube.com" },
  { title: "Instagram", url: "https://instagram.com" },
  { title: "메일 보내기", url: "mailto:hello@example.com" },
];

// 타자 치는 효과: 한 글자씩 쓰고 → 잠깐 멈추고 → 지우고 → 다음 아이디로
function useTypingHandle() {
  const [text, setText] = useState(SAMPLE_HANDLES[0]); // 지금 주소창에 보이는 글자
  const [index, setIndex] = useState(0); // 몇 번째 예시 아이디인지
  const [deleting, setDeleting] = useState(false); // 지우는 중인지

  useEffect(() => {
    // "움직임 줄이기"를 켠 사용자에게는 글자를 움직이지 않고 첫 아이디만 보여 준다
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const full = SAMPLE_HANDLES[index]; // 이번에 써야 할 아이디 전체
    let delay = deleting ? 45 : 110; // 지울 때는 빠르게, 쓸 때는 천천히
    if (!deleting && text === full) delay = 1600; // 다 썼으면 잠깐 보여 주기

    const timer = setTimeout(() => {
      if (!deleting && text === full) {
        setDeleting(true); // 다 썼으니 이제 지우기 시작
      } else if (deleting && text === "") {
        setDeleting(false); // 다 지웠으니
        setIndex((i) => (i + 1) % SAMPLE_HANDLES.length); // 다음 아이디로 (끝이면 처음으로)
      } else {
        // 한 글자 늘리거나 줄이기
        setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      }
    }, delay);
    return () => clearTimeout(timer); // 화면을 떠나면 타이머 정리
  }, [text, index, deleting]);

  return text;
}

export default function LandingPreview() {
  const handle = useTypingHandle();

  return (
    // 휴대폰 모형 전체. 화면 낭독기에는 "미리보기 그림"이라고만 알려 준다
    // pr-4 pb-4: 뒤의 주황 판이 오른쪽·아래로 비껴 나온 만큼 자리를 잡아 둬서, 좁은 화면에서도 화면 밖으로 넘치지 않게 한다
    <figure aria-label="mylink 페이지 미리보기" className="relative mx-auto w-full max-w-[316px] pr-4 pb-4">
      {/* 뒤에 깔린 주황 판: 휴대폰이 살짝 떠 보이게 하는 장식 (오른쪽·아래로 12px 비껴서 살짝 기울임) */}
      <div aria-hidden className="absolute top-3 right-1 bottom-1 left-3 rotate-2 rounded-[1.6rem] bg-accent" />

      {/* 휴대폰 몸체: 검정(carbon) 테두리 + 둥둥 떠 있는 움직임(landing-float) */}
      <div className="landing-float relative rounded-[1.6rem] border-[6px] border-carbon bg-background shadow-hard">
        {/* 위쪽 스피커 홈 */}
        <div aria-hidden className="mx-auto mt-1.5 h-1.5 w-14 rounded-full bg-carbon" />

        {/* 주소창: 자물쇠 + "mylink/아이디" + 깜빡이는 커서 */}
        <div className="bevel-inset mx-3 mt-2 flex items-center gap-1 bg-popover px-2 py-1 font-mono text-xs text-foreground">
          <Lock aria-hidden className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">mylink/</span>
          <span className="font-bold">{handle}</span>
          <span aria-hidden className="landing-caret -ml-0.5 h-3.5 w-px bg-foreground" />
        </div>

        {/* 예시 프로필 */}
        <div className="flex flex-col items-center gap-1 px-4 pt-4 pb-3 text-center">
          {/* 아바타: 진짜 프로필과 같은 검정 굵은 테두리 + 각진 그림자 */}
          <div className="flex size-16 items-center justify-center rounded-full border-3 border-carbon bg-popover text-2xl shadow-hard">
            <span aria-hidden>👾</span>
          </div>
          <p className="mt-1 text-lg font-black text-primary-foreground text-shadow-hard">Dev Kim</p>
          <p className="text-xs font-bold text-foreground">프론트엔드 개발자 · 오늘도 커밋 중</p>
        </div>

        {/* 예시 링크 줄들: 하나씩 차례로 떠오른다 (animationDelay 로 시간차) */}
        <ul className="flex flex-col gap-2 px-3 pb-5">
          {SAMPLE_LINKS.map((link, i) => (
            <li
              key={link.title}
              className="group relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:fill-mode-both motion-safe:duration-500"
              style={{ animationDelay: `${300 + i * 150}ms` }} // 0.3초 뒤부터 0.15초 간격으로
            >
              {/* 진짜 링크 버튼(LinkButton)과 같은 모양: 입체 금속판 + 아이콘 칸 + 제목 + 주황 화살표 */}
              <div className="flex items-center gap-2 rounded-sm border border-t-bevel border-l-bevel border-r-border border-b-2 border-b-border bg-card px-2 py-1.5 transition-colors group-hover:bg-muted">
                <LinkIcon url={link.url} className="size-6" />
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-muted-foreground">{link.title}</span>
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-accent-edge bg-accent text-accent-foreground">
                  <ChevronRight aria-hidden className="size-3" strokeWidth={3} />
                </span>
              </div>
              {/* 마우스를 올리면 튀어 오르는 "+1" 배지 → 클릭 수를 세 준다는 걸 보여 주는 장난 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-2 right-1 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground opacity-0 shadow-hard group-hover:landing-pop"
              >
                +1 클릭
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
