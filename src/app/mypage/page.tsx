// /mypage 의 "주소 담당" 파일입니다. 내 링크를 보고 바로 추가하는 화면.
// 실제 화면은 LocalStorage를 읽어야 하므로 클라이언트 컴포넌트(MyPageView)에 맡깁니다.

import MyPageView from "@/components/mypage/MyPageView";

export default function MyPage() {
  return <MyPageView />;
}
