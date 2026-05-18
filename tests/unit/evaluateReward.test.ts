import { evaluateReward } from "../../src/agent/evaluateReward";

describe("evaluateReward (unit)", () => {
  const TIMEOUT_MS = 30_000;

  it("returns 1.0 for perfect execution (all success, instant)", () => {
    const result = evaluateReward(
      { successSteps: 10, failureSteps: 0, durationMs: 0 },
      TIMEOUT_MS,
    );
    expect(result.reward).toBeCloseTo(1.0, 5);
  });

  it("returns 0.0 for all failures with max duration", () => {
    const result = evaluateReward(
      { successSteps: 0, failureSteps: 10, durationMs: TIMEOUT_MS },
      TIMEOUT_MS,
    );
    expect(result.reward).toBe(0);
  });

  it("normalises speed bonus to 0 when duration exceeds timeout", () => {
    const result = evaluateReward(
      { successSteps: 5, failureSteps: 5, durationMs: TIMEOUT_MS * 2 },
      TIMEOUT_MS,
    );
    // successRate = 0.5 * 0.8 = 0.4; speedBonus = 0
    expect(result.reward).toBeCloseTo(0.4, 5);
  });

  it("returns 0 when there are no steps", () => {
    const result = evaluateReward(
      { successSteps: 0, failureSteps: 0, durationMs: 1000 },
      TIMEOUT_MS,
    );
    expect(result.reward).toBe(0);
  });

  it("exposes all metrics in the result", () => {
    const result = evaluateReward(
      { successSteps: 8, failureSteps: 2, durationMs: 1000, custom: { extra: 42 } },
      TIMEOUT_MS,
    );
    expect(result.metrics.successSteps).toBe(8);
    expect(result.metrics.failureSteps).toBe(2);
    expect(result.metrics.totalSteps).toBe(10);
    expect(result.metrics.extra).toBe(42);
  });

  it("throws for non-positive timeoutMs", () => {
    expect(() =>
      evaluateReward({ successSteps: 1, failureSteps: 0, durationMs: 10 }, 0),
    ).toThrow("timeoutMs must be positive");
  });

  it("reward is always in [0, 1]", () => {
    const cases = [
      { successSteps: 100, failureSteps: 0, durationMs: 0 },
      { successSteps: 0, failureSteps: 100, durationMs: 100_000 },
      { successSteps: 3, failureSteps: 7, durationMs: 5000 },
    ];
    for (const metrics of cases) {
      const { reward } = evaluateReward(metrics, TIMEOUT_MS);
      expect(reward).toBeGreaterThanOrEqual(0);
      expect(reward).toBeLessThanOrEqual(1);
    }
  });
});
