/**
 * Brand<K, T>
 *
 * 일반 타입 K를 "이 모듈을 거쳐서만 만들 수 있는" 고유 타입으로 만든다.
 *
 * 사용 패턴:
 *   1. ID 타입에 사용 (가장 흔함)
 *      type UserId = Brand<string, "UserId">;
 *      type StudyId = Brand<number, "StudyId">;
 *
 *   2. Value Object에 사용
 *      type Capacity = Brand<
 *        Readonly<{ current: number; max: number }>,
 *        "Capacity"
 *      >;
 *
 *   3. 검증 통과한 문자열에 사용
 *      type Email = Brand<string, "Email">;
 *      type NonEmptyString = Brand<string, "NonEmpty">;
 *
 * 핵심 효과:
 *   - 외부에서 직접 객체/원시값으로 만들 수 없음
 *     const id: UserId = "abc";        // ❌ TS 에러
 *     const id: UserId = UserId.of("abc");  // ✅ 모듈 함수 거쳐야 함
 *
 *   - 같은 string인데도 UserId와 StudyId가 섞이지 않음
 *     function load(id: UserId) {...}
 *     load(studyId);                   // ❌ TS 에러
 *
 * 두 번째 타입 인자 T는 단순한 "이름표" 역할.
 * 같은 K(예: string)를 가진 다른 brand끼리 구분하는 용도.
 */
export type Brand<K, T> = K & { readonly __brand: T };
