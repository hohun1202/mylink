# mylink 디자인 시스템 — Nintendo.com 2001 메탈릭 크롬

- 작성일: 2026-09-22
- **출처 (중요)**: 원본 `design.md` 파일은 남아 있지 않다. 이 문서는 랜딩 페이지(커밋 `56e720c`, `src/app/page.tsx`)와 `src/app/globals.css` 에 **실제로 쓰인 값에서 되살린 것**이다. 원본 문서에만 있던 세부 규칙은 빠져 있을 수 있다.
- 적용 방법: PRD 1.4절 — 아래 값을 shadcn/ui 토큰(`globals.css` 의 CSS 변수)과 컴포넌트 variant 로 옮겨 쓴다.

---

## 1. 분위기

2001년 무렵 Nintendo.com 처럼 **눌러 찍은 금속판** 느낌.
- 흐림(blur) 없는 **각진 그림자**, 위·왼쪽은 밝고 오른쪽·아래는 진한 **입체 테두리(bevel)**
- 둥근 모서리 대신 **거의 각진 모서리**
- 파란 보라 계열 바탕 + 빨강·주황 포인트

## 2. 색 → shadcn 토큰

| 이름 | 값 | shadcn 토큰 | 쓰는 곳 |
|---|---|---|---|
| canvas | `#7a8aba` | `--background` | 페이지 바탕 |
| ink / carbon | `#21242e` | `--foreground`, `--carbon` | 본문 글자, 아이콘 칸, 아바타 테두리 |
| platinum | `#dedede` | `--card` | 링크 줄·패널 면 |
| white | `#ffffff` | `--popover`, `--primary-foreground` | 떠 있는 창, 빨강·주황 위 글자, 큰 제목 글자 |
| Nintendo red | `#e60012` | `--primary`, `--destructive` | 주요 버튼, 로고 |
| periwinkle | `#8ba1d4` | `--secondary` | 보조 면 |
| ice | `#c0d5e6` | `--muted` | 마우스를 올렸을 때 면 |
| chrome indigo | `#3d4f97` | `--muted-foreground`, `--border`, `--input` | 링크 제목, 테두리의 그림자 쪽, 큰 제목 그림자 |
| signal orange | `#f68d1f` | `--accent`, `--ring` | 화살표 버튼, 포커스 |
| orange edge | `#c86a00` | `--accent-edge` | 주황 버튼 테두리 |
| bevel light | `#c8d4ee` | `--bevel` | 테두리의 빛 받는 쪽(위·왼쪽) |
| 그 밖 | lavender `#acace7`, sky `#9fbee7`, amber `#ecab37`, nav gold `#e48600` | (아직 토큰 없음) | 랜딩 페이지 전용 |

- `--muted-foreground`(인디고)는 **밝은 면(card·muted) 위에서만** 쓴다. canvas 바탕 위에서는 대비가 낮으므로 `--foreground` 를 쓴다.

## 3. 글꼴

- 본문·제목 모두 **Arial, Helvetica, sans-serif** (웹폰트 내려받지 않음). 코드·숫자는 Courier New.
- 큰 제목: 아주 굵게(`font-black`), **흰 글자 + 인디고 각진 그림자** (`text-shadow-hard` = `3px 3px 0 인디고`).
- 작은 라벨(랜딩의 메뉴·섹션 바): 대문자, 11px 안팎, 굵게, 자간 0.5px.

## 4. 모양

| 항목 | 값 | 토큰·클래스 |
|---|---|---|
| 모서리 | 거의 각짐 | `--radius: 0.25rem` |
| 입체 테두리 | 위·왼쪽 1px `bevel`, 오른쪽 1px·아래 2px `인디고` | `Button variant="bevel"` |
| 각진 그림자 | `3px 3px 0 carbon` | `shadow-hard` |
| 아바타 | 원형, 3px carbon 테두리 + 각진 그림자, 흰 바탕 | `Avatar variant="framed"` |
| 아이콘 칸 | carbon 네모 + 인디고 1px 테두리 + 흰 아이콘 | `LinkButton` 안 |
| 화살표 버튼 | 주황 원 + 진한 주황 테두리 + 흰 `>` | `LinkButton` 안 |

## 5. 컴포넌트에 적용한 것 (2026-09-22)

| 컴포넌트 | 적용 |
|---|---|
| `ui/button` | `variant="bevel"` 추가 — platinum 면 + 입체 테두리, 올리면 ice |
| `ui/avatar` | `variant="framed"` 추가 |
| `link/LinkButton` | bevel 버튼 + carbon 아이콘 칸 + 인디고 굵은 제목 + 주황 화살표 원 |
| `profile/ProfileHeader` | framed 아바타 + 흰 글자·인디고 그림자 이름 + 진한 소개 글 |

## 6. 아직 옮기지 않은 것

- 랜딩 페이지(`src/app/page.tsx`)는 이 값들을 **16진수 인라인 스타일과 전역 클래스(`.plate`, `.chip`, `.command-slab`, `.chamfered` 등)** 로 직접 쓰고 있다. 랜딩을 다시 만들 때(F1) 이 문서의 토큰으로 옮기고 전역 클래스는 정리한다.
- 45° 잘린 모서리(chamfer), 망점 무늬(halftone), 대문자 라벨 바는 아직 토큰·variant 가 없다.
