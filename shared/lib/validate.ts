// shared/lib/validate.ts — 검증 어댑터 + 선택(Strategy)
//
// - 어댑터: 각 검증 lib을 공통 형태 `(schema, data) => Result<T, ValidationError>`로 conform.
// - 선택: `validate`가 *활성 어댑터*를 가리킴. lib 교체 = 맨 아래 한 줄만.
// - 소비처는 `validate`만 import → zod를 모름.
import { err, ok, type Result } from "@/shared/kernel/Result";
import type { ValidationError } from "@/shared/kernel/validation";
import { z } from "zod";

// ── 어댑터: zod ──────────────────────────────
const zodValidator = <T>(schema: z.ZodType<T>, data: unknown): Result<T, ValidationError> => {
  const result = schema.safeParse(data);
  if (result.success) return ok(result.data);

  const first = result.error.issues[0];
  return err({ field: first.path[0] as string, message: first.message });
};

// ── 어댑터: yup (예시 — 교체 시 추가) ─────────
// const yupValidator = <T>(schema: yup.Schema<T>, data: unknown): Result<T, ValidationError> => {
//   try { return ok(schema.validateSync(data, { abortEarly: true })); }
//   catch (e) { const err_ = e as yup.ValidationError; return err({ field: err_.path, message: err_.message }); }
// };

// ── 선택: 활성 어댑터 ────────────────────────
// 검증 lib을 바꾸려면 *이 줄만* 교체 (예: zodValidator → yupValidator).
// 그러면 zod 스키마를 넘기던 모든 호출부가 타입 에러로 드러남 → 빠뜨림 0.
export const validate = zodValidator;
