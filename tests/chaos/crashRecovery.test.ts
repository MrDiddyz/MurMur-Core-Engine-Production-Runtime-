import { runAgent } from "../../src/agent/runAgent";
import { _clearEventLog, getAllEvents } from "../../src/events/appendEvent";
import { _clearExecutionStore } from "../../src/state/executionStore";
import { _clearVariantStore, registerVariant } from "../../src/state/variantStore";

function registerBaseline() {
  registerVariant(
    { learningRate: 0.01, explorationRate: 0.1, discountFactor: 0.99 },
    "1.0.0",
    true,
  );
}

describe("Chaos test — forced crash / timeout recovery", () => {
  beforeEach(() => {
    _clearEventLog();
    _clearExecutionStore();
    _clearVariantStore();
    registerBaseline();
  });

  it("returns FAILED status when the task throws", async () => {
    const result = await runAgent({
      configOverrides: { maxMutationAttempts: 0 },
      task: async () => {
        throw new Error("Simulated task crash");
      },
    });

    expect(result.status).toBe("FAILED");
    expect(result.reward).toBe(0);
  });

  it("emits ROLLBACK_TRIGGERED on task crash", async () => {
    await runAgent({
      configOverrides: { maxMutationAttempts: 0 },
      task: async () => {
        throw new Error("crash");
      },
    });

    const types = getAllEvents().map((e) => e.type);
    expect(types).toContain("ROLLBACK_TRIGGERED");
    expect(types).toContain("ROLLBACK_COMPLETED");
  });

  it("times out and triggers rollback when task exceeds executionTimeoutMs", async () => {
    const result = await runAgent({
      configOverrides: {
        executionTimeoutMs: 50,
        maxMutationAttempts: 0,
      },
      task: () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                successSteps: 1,
                failureSteps: 0,
                durationMs: 100,
              }),
            200, // 200 ms > 50 ms timeout
          ),
        ),
    });

    expect(result.status).toBe("FAILED");
    const types = getAllEvents().map((e) => e.type);
    expect(types).toContain("EXECUTION_TIMEOUT");
    expect(types).toContain("ROLLBACK_TRIGGERED");
  }, 10_000);

  it("continues running after a crash (subsequent run succeeds)", async () => {
    // First run crashes
    await runAgent({
      configOverrides: { maxMutationAttempts: 0 },
      task: async () => {
        throw new Error("first run crash");
      },
    });

    _clearEventLog();

    // Second run succeeds
    const result = await runAgent({
      configOverrides: { maxMutationAttempts: 0 },
      task: async () => ({
        successSteps: 10,
        failureSteps: 0,
        durationMs: 100,
      }),
    });

    expect(result.status).toBe("COMPLETED");
    expect(result.reward).toBeGreaterThan(0);
  });
});
