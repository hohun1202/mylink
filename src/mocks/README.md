# Mock 데이터 (JSON · 가짜 백엔드 API)

실제 서버·DB가 없는 지금(PRD 1.3), 화면을 먼저 만들기 위한 **가짜 데이터**입니다.
필드 이름은 PRD 5장 데이터 모델(`User`, `Link`)을 따릅니다. 이메일·주소는 `hohun1202`를 빼면 모두 가짜입니다.

> 아직 코드에 연결하지 않았습니다. 지금 화면은 `src/lib/mockData.ts` 를 씁니다.

## 1. `db.json` — 백엔드 DB에 저장된 모양

| 컬렉션 | 내용 |
|---|---|
| `users` | 사용자 4명 |
| `links` | 링크 14개. `userId` 로 주인을, `order` 로 화면 순서를 나타냄 |

PRD 5장의 LocalStorage 모양(`User.links` 배열 안에 링크가 들어 있음)과 달리, 실제 DB처럼 **사용자와 링크를 나눠 저장**하고 `userId` 로 연결했습니다. 배열 순서 대신 `order` 숫자로 순서를 정합니다.

| 사용자 | 용도 |
|---|---|
| `hohun1202` | 실제 본인 링크 4개 (기존 `mockData.ts` 와 같음) |
| `demo` | 링크 10개 — PRD F8 **링크 아이콘 규칙**을 한 줄씩 모두 확인 + 아주 긴 제목 |
| `newbie` | 링크 0개, 소개 비어 있음 — **빈 목록 화면** 확인용 |
| (핸들 없음) | `handle: null` — **온보딩 전** 사용자 (F3 확인용) |

`demo` 링크 ↔ 아이콘 규칙: 인스타그램 → Instagram / `youtube.com`·`youtu.be` → YouTube / `x.com` → X / `velog.io`·`blog.naver.com` → 블로그 / `github.com` → GitHub / `mailto:` → 메일 / `example.com` → 기본 링크 아이콘

## 2. `api/` — API를 불렀을 때 돌려받는 응답 모양

파일 이름 규칙: `메서드_경로.상태코드.json` (요청 본문은 `.request.json`)
성공은 `{ "data": … }`, 실패는 `{ "error": { "code", "message", "fields"? } }` 모양으로 통일했습니다.

| 요청 | 파일 | 상황 |
|---|---|---|
| `GET /api/profiles/demo` | `GET_profiles_demo.200.json` | 공개 페이지 (F8) — 이메일·내부 ID는 빼고 공개 정보만 |
| `GET /api/profiles/hohun1202` | `GET_profiles_hohun1202.200.json` | 〃 |
| `GET /api/profiles/newbie` | `GET_profiles_newbie.200.json` | 링크가 0개인 공개 페이지 |
| `GET /api/profiles/unknown` | `GET_profiles_unknown.404.json` | 없는 핸들 → "페이지를 찾을 수 없어요" |
| `GET /api/me/links` | `GET_me_links.200.json` | 대시보드 내 링크 목록 (F5, `demo` 기준) |
| `POST /api/me/links` | `POST_me_links.request.json` → `.201.json` | 링크 추가 성공 |
| 〃 | `POST_me_links.400.json` | 제목 비었음 · URL 형식 오류 |
| `PATCH /api/me/links/l_109` | `PATCH_me_links_l_109.request.json` → `.200.json` | 링크 제목 수정 |
| `DELETE /api/me/links/l_110` | `DELETE_me_links_l_110.200.json` | 링크 삭제 |
| `DELETE /api/me/links/l_999` | `DELETE_me_links_l_999.404.json` | 없는 링크 삭제 시도 |
| `PUT /api/me/links/order` | `PUT_me_links_order.request.json` → `.200.json` | 드래그로 순서 변경 |

주소(`/api/...`)는 이 Mock 데이터를 위해 정한 **예시 설계**이며, PRD에 확정된 것은 아닙니다.
