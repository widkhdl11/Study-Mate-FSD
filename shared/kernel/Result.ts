/**
 * Result<T, E>
 *
 * 성공/실패를 값으로 표현하는 판별 유니온.
 * throw 대신 사용해서 에러를 타입 시스템에 드러낸다.
 *
 * @example
 *   const r = divide(10, 0);
 *   if (!r.ok) {
 *     // r.error: "DivisionByZero"
 *     return r;
 *   }
 *   // r.value: number
 *   console.log(r.value);
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** 성공 결과를 만든다. */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** 실패 결과를 만든다. */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// ─────────────────────────────────────────────
// 헬퍼: 합성과 변환
// ─────────────────────────────────────────────

/**
 * 성공이면 값을 변환, 실패면 그대로 전파.
 *
 * @example
 *   const r = ok(5);
 *   map(r, (n) => n * 2);  // ok(10)
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> => (result.ok ? ok(fn(result.value)) : result);

/**
 * 성공이면 다음 Result 반환, 실패면 그대로 전파.
 * Result를 반환하는 함수들을 체이닝할 때 사용.
 *
 * @example
 *   andThen(parseNumber("3"), (n) => n > 0 ? ok(n) : err("음수"));
 */
export const andThen = <T, U, E, E2>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E2>,
): Result<U, E | E2> => (result.ok ? fn(result.value) : result);

/**
 * 비동기 andThen.
 *
 * @example
 *   const r = await andThenAsync(studyR, async (s) => await save(s));
 */
export const andThenAsync = async <T, U, E, E2>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E2>>,
): Promise<Result<U, E | E2>> =>
  result.ok ? await fn(result.value) : result;

/**
 * 실패 케이스의 에러를 변환.
 *
 * @example
 *   mapError(r, (e) => ({ kind: "DomainError", inner: e }));
 */
export const mapError = <T, E, E2>(
  result: Result<T, E>,
  fn: (error: E) => E2,
): Result<T, E2> => (result.ok ? result : err(fn(result.error)));

/**
 * 실패면 기본값 반환, 성공이면 값 반환.
 *
 * @example
 *   unwrapOr(parseNumber("abc"), 0);  // 0
 */
export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  result.ok ? result.value : fallback;

/**
 * 여러 Result를 합친다. 하나라도 실패면 첫 실패를 반환.
 *
 * @example
 *   all([ok(1), ok(2), ok(3)]);  // ok([1, 2, 3])
 *   all([ok(1), err("X"), ok(3)]);  // err("X")
 */
export const all = <T, E>(
  results: ReadonlyArray<Result<T, E>>,
): Result<T[], E> => {
  const values: T[] = [];
  for (const r of results) {
    if (!r.ok) return r;
    values.push(r.value);
  }
  return ok(values);
};
