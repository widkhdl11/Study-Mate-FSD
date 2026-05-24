import { describe, expect, it } from "vitest";
import { all, andThen, andThenAsync, err, map, mapError, ok, Result, unwrapOr } from "./Result";

describe("Result", () => {
  describe("ok / err", () => {
    it("ok는 성공 결과를 만든다", () => {
      const r = ok(42);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(42);
    });

    it("err는 실패 결과를 만든다", () => {
      const r = err("실패");
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBe("실패");
    });
  });

  describe("map", () => {
    it("성공이면 값을 변환한다", () => {
      const r = map(ok(5), (n) => n * 2);
      expect(r).toEqual({ ok: true, value: 10 });
    });

    it("실패면 에러를 그대로 전파한다", () => {
      const r = map(err("X") as ReturnType<typeof err<string>>, (n: number) => n * 2);
      expect(r).toEqual({ ok: false, error: "X" });
    });
  });

  describe("andThen", () => {
    it("성공이면 다음 Result를 반환한다", () => {
      const r = andThen(ok(5), (n) => (n > 0 ? ok(n * 2) : err("음수")));
      expect(r).toEqual({ ok: true, value: 10 });
    });

    it("성공이지만 다음 단계에서 실패할 수 있다", () => {
      const r = andThen(ok(-1), (n) => (n > 0 ? ok(n * 2) : err("음수")));
      expect(r).toEqual({ ok: false, error: "음수" });
    });

    it("실패면 그대로 전파한다 (다음 함수 호출 안 됨)", () => {
      let called = false;
      const r = andThen(err("앞에서실패") as ReturnType<typeof err<string>>, (n: number) => {
        called = true;
        return ok(n);
      });
      expect(r).toEqual({ ok: false, error: "앞에서실패" });
      expect(called).toBe(false);
    });
  });

  describe("andThenAsync", () => {
    it("비동기 andThen이 동작한다", async () => {
      const r = await andThenAsync(ok(5), async (n) => ok(n * 2));
      expect(r).toEqual({ ok: true, value: 10 });
    });

    it("실패면 비동기 함수를 호출하지 않는다", async () => {
      let called = false;
      const r = await andThenAsync(err("X") as ReturnType<typeof err<string>>, async (n: number) => {
        called = true;
        return ok(n);
      });
      expect(r).toEqual({ ok: false, error: "X" });
      expect(called).toBe(false);
    });
  });

  describe("mapError", () => {
    it("실패면 에러를 변환한다", () => {
      const r = mapError(err("X") as ReturnType<typeof err<string>>, (e) => `wrapped: ${e}`);
      expect(r).toEqual({ ok: false, error: "wrapped: X" });
    });

    it("성공이면 그대로 전파한다", () => {
      const r = mapError(ok(5), (e: string) => `wrapped: ${e}`);
      expect(r).toEqual({ ok: true, value: 5 });
    });
  });

  describe("unwrapOr", () => {
    it("성공이면 값을 반환한다", () => {
      expect(unwrapOr(ok(5), 0)).toBe(5);
    });

    it("실패면 fallback을 반환한다", () => {
      expect(unwrapOr(err("X") as ReturnType<typeof err<string>>, 0 as number)).toBe(0);
    });
  });

  describe("all", () => {
    it("모두 성공이면 값 배열을 반환한다", () => {
      const r = all([ok(1), ok(2), ok(3)]);
      expect(r).toEqual({ ok: true, value: [1, 2, 3] });
    });

    it("하나라도 실패면 첫 실패를 반환한다", () => {
      const r = all([ok(1), err("두번째실패"), ok(3)]);
      expect(r).toEqual({ ok: false, error: "두번째실패" });
    });

    it("빈 배열이면 빈 성공을 반환한다", () => {
      const r = all([]);
      expect(r).toEqual({ ok: true, value: [] });
    });
  });

  describe("실전 패턴: Result 체이닝", () => {
    type ParseError = "NotANumber" | "Negative";

    const parseNumber = (s: string): Result<number, ParseError> => {
      const n = Number(s);
      return Number.isNaN(n) ? err("NotANumber") : ok(n);
    };

    const ensurePositive = (n: number): Result<number, ParseError> =>
      n >= 0 ? ok(n) : err("Negative");

    it("성공 체이닝", () => {
      const r = andThen(parseNumber("42"), ensurePositive);
      expect(r).toEqual({ ok: true, value: 42 });
    });

    it("첫 단계 실패", () => {
      const r = andThen(parseNumber("abc"), ensurePositive);
      expect(r).toEqual({ ok: false, error: "NotANumber" });
    });

    it("두 번째 단계 실패", () => {
      const r = andThen(parseNumber("-5"), ensurePositive);
      expect(r).toEqual({ ok: false, error: "Negative" });
    });
  });
});
