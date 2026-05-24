/**
 * Capacity
 *
 * 스터디의 정원 정보(현재 인원 / 최대 인원)를 한 덩어리로 다루는 Value Object.
 *
 * 불변 조건:
 *   1. current, max 둘 다 정수
 *   2. current >= 0
 *   3. max >= 1
 *   4. current <= max
 *
 * 이 규칙은 construct에서 강제되며, 외부에서는 깨진 Capacity를 만들 수 없다.
 */

import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";

// ─────────────────────────────────────────────
// 1. 타입 정의
// ─────────────────────────────────────────────

export type Capacity = Brand<
  Readonly<{
    current: number;
    max: number;
  }>,
  "Capacity"
>;

// ─────────────────────────────────────────────
// 2. 에러 판별 유니온
// ─────────────────────────────────────────────

/**
 * 케이스를 잘게 쪼갠 이유:
 *   - 호출자가 어떤 규칙을 어겼는지 정확히 알 수 있음
 *   - UI에서 "정원이 가득 찼습니다" vs "이미 비어있습니다"처럼
 *     다른 메시지를 보여줄 수 있음
 *
 * AlreadyFull / AlreadyEmpty는 Overflow / NegativeCurrent와 의미가 다르다:
 *   - Overflow: 처음부터 깨진 값으로 만들려고 함 (예: of(10, 5))
 *   - AlreadyFull: 정상 Capacity에 한 명 더 추가하려는데 자리가 없음
 */
export type CapacityError =
  | {
      readonly kind: "NotInteger";
      readonly current: number;
      readonly max: number;
    }
  | { readonly kind: "NegativeCurrent"; readonly current: number }
  | { readonly kind: "InvalidMax"; readonly max: number }
  | { readonly kind: "Overflow"; readonly current: number; readonly max: number } // 정원 무결성 체크
  | { readonly kind: "AlreadyFull"; readonly max: number } // 정원이 가득찼는데 한 명 더 추가하려고 할 때
  | { readonly kind: "AlreadyEmpty" };

// ─────────────────────────────────────────────
// 3. 스마트 생성자 (외부에 노출하지 않음)
// ─────────────────────────────────────────────

const construct = (
  current: number,
  max: number,
): Result<Capacity, CapacityError> => {
  if (!Number.isInteger(current) || !Number.isInteger(max)) {
    return err({ kind: "NotInteger", current, max });
  }
  if (current < 0) {
    return err({ kind: "NegativeCurrent", current });
  }
  if (max < 1) {
    return err({ kind: "InvalidMax", max });
  }
  if (current > max) {
    return err({ kind: "Overflow", current, max });
  }
  return ok({ current, max } as Capacity);
};

// ─────────────────────────────────────────────
// 4. 모듈 함수 묶음
// ─────────────────────────────────────────────

export const Capacity = {
  // ── 생성 ──────────────────────────────────

  /**
   * 두 값을 받아 Capacity를 만든다. 불변 조건 위반 시 CapacityError.
   *
   * @example
   *   const r = Capacity.of(3, 10);
   *   if (!r.ok) return r;
   *   r.value; // Capacity
   */
  of: construct,

  /**
   * 비어있는 정원을 만든다 (current=0).
   * 스터디를 막 만들었을 때 사용.
   *
   * @example
   *   const r = Capacity.empty(10); // 0 / 10
   */
  empty: (max: number): Result<Capacity, CapacityError> => construct(0, max),

  // ── 질의 ──────────────────────────────────

  isFull: (c: Capacity): boolean => c.current >= c.max,

  isEmpty: (c: Capacity): boolean => c.current === 0,

  /** 남은 자리 수. */
  remaining: (c: Capacity): number => c.max - c.current,

  equals: (a: Capacity, b: Capacity): boolean =>
    a.current === b.current && a.max === b.max,

  // ── 변환 (원본은 안 건드리고 새 Capacity 반환) ──

  /**
   * 한 명 추가. 꽉 차 있으면 AlreadyFull 에러.
   *
   * 흐름:
   *   1. 미리 isFull 체크 → 더 구체적인 에러("AlreadyFull")를 줄 수 있음
   *   2. 통과하면 construct를 다시 거침 → 검증 로직을 한 곳에 모은다
   */
  increment: (c: Capacity): Result<Capacity, CapacityError> => {
    if (c.current >= c.max) {
      return err({ kind: "AlreadyFull", max: c.max });
    }
    return construct(c.current + 1, c.max);
  },

  /**
   * 한 명 제거. 이미 비어있으면 AlreadyEmpty 에러.
   */
  decrement: (c: Capacity): Result<Capacity, CapacityError> => {
    if (c.current === 0) {
      return err({ kind: "AlreadyEmpty" });
    }
    return construct(c.current - 1, c.max);
  },
};
