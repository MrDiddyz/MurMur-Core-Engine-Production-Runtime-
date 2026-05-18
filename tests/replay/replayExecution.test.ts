import { runAgent } from "../../src/agent/runAgent";
import { _clearEventLog, getAllEvents } from "../../src/events/appendEvent";
import { _clearExecutionStore } from "../../src/state/executionStore";
import { _clearVariantStore, registerVariant } from "../../src/state/variantStore";
import type { RewardMetrics } from "../../src/agent/evaluateReward";

/** Fixed-output task: same input always returns same metrics. */
function deterministicTask(): Promise<RewardMetrics> {
  return Promise.resolve({
    successSteps: 8,
    failureSteps: 2,
    durationMs: 100,
  });
}

describe("Replay test — same input = same output", () => {
  beforeEach(() => {
    _clearEventLog();
    _clearExecutionStore();
    _clearVariantStore();
    registerVariant(
      { learningRate: 0.01, explorationRate: 0.1, discountFactor: 0.99 },
      "1.0.0",
      true,
    );
  });

  it("produces the same reward for two runs with the same seed", async () => {
    const opts = {
      configOverrides: { seed: 42, maxMutationAttempts: 0, rewardThreshold: 0.5 },
      task: deterministicTask,
    };

    const r1 = await runAgent(opts);
    _clearEventLog();
    _clearExecutionStore();
    _clearVariantStore();
    registerVariant(
      { learningRate: 0.01, explorationRate: 0.1, discountFactor: 0.99 },
      "1.0.0",
      true,
    );

    const r2 = await runAgent(opts);

    expect(r1.reward).toBe(r2.reward);
    expect(r1.status).toBe(r2.status);
  });

  it("emits EXECUTION_STARTED and EXECUTION_COMPLETED events", async () => {
    await runAgent({
      configOverrides: { seed: 10, maxMutationAttempts: 0 },
      task: deterministicTask,
    });

    const events = getAllEvents();
    const types = events.map((e) => e.type);
    expect(types).toContain("EXECUTION_STARTED");
    expect(types).toContain("EXECUTION_COMPLETED");
  });

  it("every event has a non-empty executionId", async () => {
    await runAgent({
      configOverrides: { seed: 10, maxMutationAttempts: 0 },
      task: deterministicTask,
    });

    for (const event of getAllEvents()) {
      expect(event.executionId).toBeTruthy();
    }
  });
});
