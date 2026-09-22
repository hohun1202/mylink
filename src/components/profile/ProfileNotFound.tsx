// 없는 핸들로 접속했을 때의 안내입니다. (PRD F8 · 시나리오 A-1)
// 별도 디자인 없이 shadcn/ui 의 Empty 로 문구만 보여줍니다.

import { SearchX } from "lucide-react"; // "찾을 수 없음" 아이콘
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ProfileNotFound({ handle }: { handle: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle className="text-lg">페이지를 찾을 수 없어요</EmptyTitle>
        {/* 방문자가 주소를 잘못 쳤는지 확인할 수 있게 입력한 핸들을 보여줌 */}
        <EmptyDescription className="break-all text-foreground">mylink/{handle}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
