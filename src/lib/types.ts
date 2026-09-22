// 마이링크에서 쓰는 데이터 모양(타입)을 한곳에 모아 둔 파일입니다.
// PRD 5장 "데이터 모델"을 코드로 옮긴 것입니다.

// 링크 버튼 하나의 모양
export type Link = {
  id: string; // 링크마다 붙는 고유 번호 (React가 목록을 구분할 때 사용)
  title: string; // 버튼에 보이는 글자
  url: string; // 버튼을 누르면 이동할 주소
};

// 프로필 페이지 하나(= 사용자 한 명)의 모양
export type Profile = {
  handle: string; // 페이지 주소에 들어가는 이름 (mylink/<handle>)
  name: string; // 표시 이름
  bio: string; // 한 줄 소개
  avatarId: string; // 기본 아바타 중 어떤 것을 골랐는지
  links: Link[]; // 링크 목록. 배열 순서 = 화면에 보이는 순서
};
