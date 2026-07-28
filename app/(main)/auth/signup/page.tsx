import { SignupCard } from "@/widgets/auth";

export default function SignupPage() {
  return (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Study Mate
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            함께 성장하는 스터디 문화
          </p>
        </div>
        <SignupCard />
      </div>
    </div>
  );
}
