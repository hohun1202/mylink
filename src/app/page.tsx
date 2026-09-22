// 첫 화면(/) 입니다. 내 프로필 + 링크 목록 + 링크 추가 버튼을 바로 보여줍니다.
// 공개 페이지(/<핸들>)와 같은 화면을 "내 핸들"로 그립니다.
// (예전 Nintendo 스타일 자기소개 페이지는 git 기록의 커밋 c0a8596 까지 남아 있음)

import ProfileView from "@/components/profile/ProfileView"; // 프로필 화면
import { MY_HANDLE } from "@/lib/me"; // 내 페이지 핸들 (로그인 전 임시)

export default function Home() {
  return <ProfileView handle={MY_HANDLE} />;
}
