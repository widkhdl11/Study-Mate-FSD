/**
 * 방 전환 로딩 경계. 이 파일이 있으면 라우터가 서버 데이터(참여자·방 상세)를
 * 기다리지 않고 네비게이션을 즉시 커밋한다 → 사이드바 활성 하이라이트가 바로 켜지고,
 * 대화 자리에 아래 스켈레톤이 즉시 나타난다(실제 데이터는 뒤에서 스트리밍).
 * 실제 대화방(ui.tsx)의 헤더·틴트 캔버스·입력 구조를 그대로 흉내 내 전환을 매끄럽게 한다.
 */
export default function ChatRoomLoading() {
  const rows = [
    { me: false, w: "w-40" },
    { me: false, w: "w-28" },
    { me: true, w: "w-44" },
    { me: false, w: "w-56" },
    { me: true, w: "w-32" },
  ]

  return (
    <div className="flex h-full w-full min-w-0 bg-paper">
      <section className="flex min-w-0 flex-1 flex-col">
        {/* 헤더 스켈레톤 */}
        <header className="flex-shrink-0 border-b border-ink/10">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-ink/10" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-ink/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-ink/10" />
            </div>
          </div>
        </header>

        {/* 메시지 스켈레톤 */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-ink/5 px-3 py-4 sm:px-4">
          <div className="space-y-4">
            {rows.map((r, i) => (
              <div key={i} className={`flex gap-2 ${r.me ? "flex-row-reverse" : "flex-row"}`}>
                {!r.me && <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-ink/10" />}
                <div className={`h-10 ${r.w} animate-pulse rounded-2xl bg-ink/10`} />
              </div>
            ))}
          </div>
        </div>

        {/* 입력 스켈레톤 */}
        <div className="flex-shrink-0 border-t border-ink/10 bg-paper px-3 py-3 sm:px-4">
          <div className="h-11 w-full animate-pulse rounded-full bg-ink/10" />
        </div>
      </section>
    </div>
  )
}
