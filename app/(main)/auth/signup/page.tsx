import { SignupCard } from "@/widgets/auth";

export default function SignupPage() {
  return (
  <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink">
              <span className="text-lg font-bold text-paper">S</span>
            </div>
          </div>
          <h1 className="font-heading text-3xl font-normal text-ink">
            Study Mate
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            함께 성장하는 스터디 문화
          </p>
        </div>
        <SignupCard />
      </div>
    </div>
  );
}
