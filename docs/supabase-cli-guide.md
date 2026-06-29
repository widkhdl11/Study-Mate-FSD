# Supabase CLI 가이드 (DB 마이그레이션)

> DB 스키마(테이블/FK/트리거/RPC/RLS)를 코드와 함께 버전관리하기 위한 워크플로.
> 다음에 또 헷갈리면 이 문서 보고 따라 하면 됨.

---

## 0. 핵심 개념

- DB 변경의 **source of truth = `supabase/migrations/` 의 SQL 파일들**.
- 원격(Supabase 클라우드) 적용 상태는 `supabase_migrations.schema_migrations` 테이블이 추적.
- **원칙: SQL Editor에서 직접 고치지 말고, migration 파일 → `db push` 순서로.** (직접 고치면 repo와 불일치 → 나중에 pull로 따라잡아야 함)

---

## 1. 설치

```bash
npm install supabase --save-dev   # 프로젝트 dev 의존성
# 이후 모든 명령은 npx supabase ...
```

## 2. 인증 — `login` 대신 토큰 환경변수 (중요)

`supabase login`은 **실행할 때마다 새 personal access token을 발급** → 20개 한도에 걸림.
→ **토큰 1개 발급해서 환경변수로** 쓰는 게 안전 (CI 방식, 토큰 안 늘어남).

1. https://supabase.com/dashboard/account/tokens → 안 쓰는 토큰 Revoke + **Generate new token** (`sbp_...`, 이 화면에서만 보임)
2. PowerShell:
   ```powershell
   # 이번 세션만
   $env:SUPABASE_ACCESS_TOKEN = "sbp_토큰값"

   # 영구 (새 터미널부터 적용)
   [System.Environment]::SetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "sbp_토큰값", "User")
   ```
→ `SUPABASE_ACCESS_TOKEN`이 있으면 CLI가 `login` 없이 인증.

## 3. 프로젝트 연결 (1회)

```bash
npx supabase init                                # supabase/ 폴더 생성 (config.toml, migrations/)
npx supabase link --project-ref <project-ref>    # ref = 대시보드 URL의 프로젝트 id, DB 비번 물어봄
```

## 4. 기존 스키마 baseline (1회, 기존 DB가 이미 있을 때 필수)

```bash
npx supabase db pull
# → supabase/migrations/<timestamp>_remote_schema.sql 생성 (현재 테이블/FK/트리거/RPC/RLS 전부 기록)
```
이걸 먼저 안 하면 로컬 재생 시 기존 트리거/RPC가 없어 깨짐.

---

## 5. 변경 워크플로 (앞으로 이렇게)

```bash
npx supabase migration new <변경이름>     # 예: add_xxx, cleanup_yyy
# → supabase/migrations/<timestamp>_<변경이름>.sql 빈 파일 생성
```
1. 그 파일에 SQL 작성 (CREATE/ALTER/DROP ...)
2. (선택) 로컬 검증 — Docker 필요:
   ```bash
   npx supabase start      # 로컬 Postgres
   npx supabase db reset   # 모든 migration 재생, 깨지는지 확인
   ```
3. 원격 적용:
   ```bash
   npx supabase db push    # 미적용 migration만 반영
   ```
4. 커밋: `git add supabase/migrations/ && git commit -m "..."`

---

## 6. (복구) SQL Editor에서 직접 고쳐버렸을 때

원격은 바뀌었는데 migration 파일엔 없음 → 불일치. 따라잡기:
```bash
npx supabase db pull       # 변경분을 새 migration 파일로 캡처
```
→ 생성된 파일 내용 확인 후 커밋. (이건 임시 복구용. 평소엔 5번 순서대로.)

---

## 7. 자주 쓰는 명령

| 명령 | 용도 |
|---|---|
| `npx supabase migration new <name>` | 새 빈 migration 생성 |
| `npx supabase db push` | 미적용 migration을 원격에 적용 |
| `npx supabase db pull` | 원격 현재 상태를 migration으로 가져오기 |
| `npx supabase migration list` | 로컬/원격 적용 상태 비교 |
| `npx supabase db reset` | (로컬) 모든 migration 재생 |
| `npx supabase migration repair --status applied <ver>` | 이미 수동 적용한 migration을 "적용됨"으로 표시 |

---

## 8. 자주 걸리는 것 (gotchas)

- **token 한도 (20개)**: `login` 쓰지 말고 `SUPABASE_ACCESS_TOKEN` 환경변수. (위 2번)
- **`db reset`/`start`는 Docker Desktop 필요**. 안 깔려있으면 로컬 검증 생략하고 `db push`만.
- **SQL Editor 직접 수정은 거꾸로** — repo와 어긋남. migration-first 권장. 이미 했으면 `db pull`로 backfill.
- **`db pull`이 트리거를 놓치는 경우가 있음**. 의심되면 원격에서 직접 확인:
  ```sql
  SELECT tgname, tgrelid::regclass AS tbl, p.proname AS fn
  FROM pg_trigger t JOIN pg_proc p ON t.tgfoid = p.oid
  WHERE NOT t.tgisinternal ORDER BY tbl, tgname;
  ```
