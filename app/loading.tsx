export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full animate-spin" />
        <p className="text-ink-soft">페이지 로딩 중...</p>
      </div>
    </div>
  );
}