import { ChatListSidebar } from "@/widgets/chat";
import { Header } from "@/widgets/header";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        {/* 마스터-디테일: 좌측 목록(상주) + 우측 대화. 넓은 화면에선 중앙 정렬로 프레이밍. */}
        <div className="mx-auto flex h-full w-full max-w-7xl md:border-x md:border-border">
          <ChatListSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
