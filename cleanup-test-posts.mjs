// 테스트 시드 정리 스크립트 (일회성 유틸, 로컬 전용)
// 실행: node cleanup-test-posts.mjs
// - posts 중 title이 "테스트 모집글 "로 시작하는 행 삭제
// - post-images 버킷의 test-posts/ 아래 파일 전부 삭제
// .env의 SUPABASE_SECRET_KEY(RLS 우회)를 사용. 프로덕션 DB에 직접 작용하니 주의.

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    })
);

const BUCKET = env.NEXT_PUBLIC_STORAGE_BUCKET_POST;
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

// 1) 테스트 posts 삭제
const { data: deleted, error: dErr } = await supabase
  .from("posts")
  .delete()
  .like("title", "테스트 모집글 %")
  .select("id");
console.log(dErr ? `posts 삭제 실패: ${dErr.message}` : `posts ${deleted.length}개 삭제`);

// 2) test-posts/ 스토리지 파일 삭제
const { data: files, error: lErr } = await supabase.storage.from(BUCKET).list("test-posts");
if (lErr) {
  console.log(`스토리지 목록 실패: ${lErr.message}`);
} else if (files.length) {
  const paths = files.map((f) => `test-posts/${f.name}`);
  const { error: rErr } = await supabase.storage.from(BUCKET).remove(paths);
  console.log(rErr ? `스토리지 삭제 실패: ${rErr.message}` : `스토리지 파일 ${paths.length}개 삭제`);
} else {
  console.log("스토리지 test-posts/ 비어있음");
}
