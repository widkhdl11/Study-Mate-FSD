import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-ink/10 bg-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading text-xl text-ink hover:text-ink/70 transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-ink text-paper flex items-center justify-center text-sm font-bold leading-none">
                S
              </div>
              Study Mate
            </Link>
            <p className="text-sm text-ink-soft">
              함께 성장하는 스터디 문화
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h1 className="font-semibold text-ink text-sm uppercase tracking-wider">
              제품
            </h1>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/posts"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  모집글
                </Link>
              </li>
              <li>
                <Link
                  href="/studies/create"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  스터디 만들기
                </Link>
              </li>
              <li>
                <Link
                  href="/profile?tab=chats"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  채팅
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h1 className="font-semibold text-ink text-sm uppercase tracking-wider">
              회사
            </h1>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  소개
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  블로그
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  문의
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h1 className="font-semibold text-ink text-sm uppercase tracking-wider">
              정책
            </h1>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  이용약관
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-ink-soft hover:text-ink transition-colors"
                >
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-paper-line pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-ink-soft">
            © {currentYear} Study Mate. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-ink-soft hover:text-ink transition-colors text-sm"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-ink-soft hover:text-ink transition-colors text-sm"
            >
              Discord
            </a>
            <a
              href="#"
              className="text-ink-soft hover:text-ink transition-colors text-sm"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
