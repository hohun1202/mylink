// 공개 프로필 페이지의 "주소 담당" 파일입니다. (PRD F8)
// 폴더 이름 [handle] 의 대괄호는 "주소의 이 자리에 아무 값이나 올 수 있다"는 뜻입니다.
// 예: /hohun1202 로 접속하면 handle = "hohun1202"

import ProfileView from "@/components/profile/ProfileView"; // 실제 화면을 그리는 컴포넌트

export default async function ProfilePage({ params }: PageProps<"/[handle]">) {
  const { handle } = await params; // Next.js 16에서는 params가 Promise라서 await로 꺼냄
  // LocalStorage는 브라우저에만 있으므로, 데이터 읽기는 클라이언트 컴포넌트에 맡김
  return <ProfileView handle={decodeURIComponent(handle)} />;
}
