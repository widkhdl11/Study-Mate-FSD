import { SignupCard } from "@/widgets/auth";

export default function SignupPage() {
  return (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/30 to-background px-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-white">S</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Study Mate
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            함께 성장하는 스터디 문화
          </p>
        </div>
        <SignupCard />
      </div>
    </div>
  );
}
