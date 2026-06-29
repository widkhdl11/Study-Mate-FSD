import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser()를 사용해야 토큰 검증됨
  // getSession()은 안전하지 않음!
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  // 보호된 경로 체크
  const protectedPaths = [
    "/posts/create",
    "/studies/create",
    "/profile",
    "/chats",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 로그인 안했는데 보호된 경로 접근 → 로그인으로
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 로그인했는데 로그인/회원가입 페이지 → 홈으로
  if (
    (request.nextUrl.pathname === "/auth/login" ||
      request.nextUrl.pathname === "/auth/signup") &&
    user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
