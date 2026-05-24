/**
 * Money 예시 (학습용)
 *
 * 이 파일은 **Capacity를 직접 작성하기 위한 참고용 예시**다.
 * 실제 빌드/런타임에 사용되지 않는다.
 *
 * VO(Value Object)의 5가지 핵심 패턴을 모두 담았다:
 *
 *   1. 브랜드 타입         → 외부에서 함부로 객체 리터럴로 못 만든다
 *   2. 스마트 생성자       → 항상 검증을 거친 인스턴스만 만들어진다 (불변 조건 보장)
 *   3. Result 기반 검증    → throw 대신 Result<T, E>로 에러를 값으로 반환
 *   4. 모듈 함수 묶음      → `Money.add(a, b)` 형태로 도메인 연산을 한 곳에 모은다
 *   5. 불변(immutable)    → readonly로 강제, 변경 함수는 새 객체를 반환
 *
 * 이 다섯 가지는 **Capacity도 똑같이** 지켜야 한다.
 */

import type { Brand } from "@/shared/kernel/Id";
import { err, ok, type Result } from "@/shared/kernel/Result";

// ─────────────────────────────────────────────
// 1. 타입 정의 (브랜드 타입)
// ─────────────────────────────────────────────

/**
 * 통화. 일단 두 개만 지원한다고 가정.
 * 실제 프로젝트라면 별도 VO나 enum-like 타입으로 뺄 수 있다.
 */
export type Currency = "KRW" | "USD";

/**
 * Money VO.
 *
 *   - amount: 0 이상의 정수 (소수점 X — 통화의 최소 단위로 표현)
 *   - currency: 통화 코드
 *
 * Readonly로 감싸서 객체 자체도 불변이다.
 * Brand로 감싸서 외부에서 `{ amount: 1, currency: "KRW" }`로 직접 못 만든다.
 */
export type Money = Brand<
  Readonly<{
    amount: number;
    currency: Currency;
  }>,
  "Money"
>;

// ─────────────────────────────────────────────
// 2. 에러 타입 (판별 유니온)
// ─────────────────────────────────────────────

/**
 * Money 생성/연산 시 발생할 수 있는 에러를 모두 모은 판별 유니온.
 *
 * 왜 string("음수 금액") 대신 객체로?
 *   - kind 필드로 정확한 케이스 매칭 가능
 *   - 추가 컨텍스트(amount: number 등)를 넣을 수 있음
 *   - 호출자가 `switch (error.kind)`로 처리 가능
 */
export type MoneyError =
  | { readonly kind: "NotInteger"; readonly amount: number }
  | { readonly kind: "Negative"; readonly amount: number }
  | { readonly kind: "CurrencyMismatch"; readonly left: Currency; readonly right: Currency };

// ─────────────────────────────────────────────
// 3. 스마트 생성자 (내부 전용)
// ─────────────────────────────────────────────

/**
 * 내부 전용 생성자. 검증을 통과해야만 Money가 만들어진다.
 *
 * 외부에서는 절대 직접 호출할 수 없도록 export 하지 않는다.
 * 외부는 반드시 `Money.of(...)`를 거쳐야 한다.
 */
const construct = (
  amount: number,
  currency: Currency,
): Result<Money, MoneyError> => {
  if (!Number.isInteger(amount)) {
    return err({ kind: "NotInteger", amount });
  }
  if (amount < 0) {
    return err({ kind: "Negative", amount });
  }
  // 모든 불변 조건 통과 → Money로 브랜딩
  return ok({ amount, currency } as Money);
};

// ─────────────────────────────────────────────
// 4. 모듈 함수 (외부 API)
// ─────────────────────────────────────────────

/**
 * `Money.of(1000, "KRW")` 같은 형태로 부르기 위한 네임스페이스.
 *
 * class를 안 쓰는 이유: this 바인딩 이슈 / 메서드 추출 시 복잡함 회피.
 * 객체 리터럴에 함수들을 모으면 같은 효과 + 트리쉐이킹도 가능.
 */
export const Money = {
  // ── 생성 ──────────────────────────────────

  /**
   * 검증을 거쳐 Money를 만든다. 실패하면 MoneyError.
   *
   * @example
   *   const r = Money.of(1000, "KRW");
   *   if (!r.ok) return r;
   *   r.value; // Money
   */
  of: construct,

  /**
   * 0원 Money. 자주 쓰이는 값은 헬퍼로 빼두면 편하다.
   *
   * @example
   *   const zero = Money.zero("KRW"); // Money
   */
  zero: (currency: Currency): Money =>
    // 0은 항상 검증 통과하므로 construct를 거치되 안전하게 unwrap.
    // (Result를 다시 풀어주는 헬퍼는 학습 후반에 다룬다)
    ({ amount: 0, currency }) as Money,

  // ── 질의(query) ───────────────────────────

  isZero: (m: Money): boolean => m.amount === 0,

  isPositive: (m: Money): boolean => m.amount > 0,

  /**
   * 같은 통화 & 같은 금액인지.
   * `===`로 객체 비교하면 안 됨 (참조 비교가 됨).
   */
  equals: (a: Money, b: Money): boolean =>
    a.currency === b.currency && a.amount === b.amount,

  // ── 변환(transform) ───────────────────────

  /**
   * 두 Money를 더한다.
   *
   * 도메인 규칙:
   *   - 통화가 다르면 더할 수 없다 → 에러
   *   - 같으면 새 Money 반환 (원본은 안 건드림)
   */
  add: (a: Money, b: Money): Result<Money, MoneyError> => {
    if (a.currency !== b.currency) {
      return err({
        kind: "CurrencyMismatch",
        left: a.currency,
        right: b.currency,
      });
    }
    return construct(a.amount + b.amount, a.currency);
  },

  /**
   * 두 Money를 뺀다. 결과가 음수면 construct가 알아서 에러로 막아준다.
   * → 도메인 규칙(음수 금지)을 한 곳에서만 강제할 수 있다.
   */
  subtract: (a: Money, b: Money): Result<Money, MoneyError> => {
    if (a.currency !== b.currency) {
      return err({
        kind: "CurrencyMismatch",
        left: a.currency,
        right: b.currency,
      });
    }
    return construct(a.amount - b.amount, a.currency);
  },

  /**
   * 정수배. 1.5배 같은 건 정책에 따라 막거나 별도 함수로 분리.
   */
  multiply: (m: Money, factor: number): Result<Money, MoneyError> =>
    construct(m.amount * factor, m.currency),

  // ── 표시(format) ──────────────────────────

  /**
   * 사람이 읽는 문자열. UI 가까이 있는 함수.
   * (정말 표시 전용이라면 widgets/ui 쪽에 두는 게 더 맞을 수도 있다)
   */
  toString: (m: Money): string => {
    const symbol = m.currency === "KRW" ? "₩" : "$";
    return `${symbol}${m.amount.toLocaleString("en-US")}`;
  },
};
