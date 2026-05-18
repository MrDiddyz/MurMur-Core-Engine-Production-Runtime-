import { loadRuntimeConfig, type RuntimeConfig } from "../config/runtimeConfig";
import { appendEvent } from "../events/appendEvent";
import {
  createExecution,
  updateExecution,
  type ExecutionRecord,
} from "../state/executionStore";
import {
  getBaselineVariant,
  getVariant,
  recordReward,
  registerVariant,
  type AgentConfig,
  type VariantRecord,
} from "../state/variantStore";
import { evaluateReward, type RewardMetrics } from "./evaluateReward";
import { mutateConfig } from "./mutation";
import { rollback } from "../baseline/rollback";

export interface AgentRunOptions {
  /** Override any config values for this run. */
  configOverrides?: Partial<RuntimeConfig>;
  /**
   * The agent's task function. Receives the active AgentConfig and must return
   * raw execution metrics. Throw to signal a hard failure.
   */
  task: (config: AgentConfig, executionId: string) => Promise<RewardMetrics>;
}

export interface AgentRunResult {
  executionId: string;
  variantId: string;
  reward: number;
  status: ExecutionRecord["status"];
}

/**
 * Run one agent execution with full mutation-learning, rollback, and event
 * tracing lifecycle.
 *
 * 1. Load/validate config.
 * 2. Obtain the current best variant (or baseline).
 * 3. Attempt up to maxMutationAttempts mutations; keep any that beat the
 *    rewardThreshold.
 * 4. Execute the task with a hard timeout.
 * 5. On failure or timeout, roll back to the baseline.
 */
export async function runAgent(options: AgentRunOptions): Promise<AgentRunResult> {
  const config = loadRuntimeConfig(options.configOverrides);

  // Ensure a baseline exists
  let activeVariant: VariantRecord;
  try {
    activeVariant = getBaselineVariant();
  } catch {
    // Auto-register a sensible default baseline on first run
    activeVariant = registerVariant(
      { learningRate: 0.01, explorationRate: 0.1, discountFactor: 0.99 },
      "1.0.0",
      true,
    );
  }

  // Attempt to find a better mutant
  let candidateVariant = activeVariant;
  for (let attempt = 0; attempt < config.maxMutationAttempts; attempt++) {
    const { mutated, delta } = mutateConfig(
      candidateVariant.config,
      config.seed + attempt,
    );
    const mutantVariant = registerVariant(mutated, `${candidateVariant.version}-mut${attempt}`);

    const probeExecution = createExecution(mutantVariant.variantId, config.seed + attempt);
    appendEvent(probeExecution.executionId, "EXECUTION_STARTED", {
      seed: config.seed + attempt,
      variantId: mutantVariant.variantId,
    });

    let probeMetrics: RewardMetrics;
    try {
      probeMetrics = await runWithTimeout(
        options.task(mutantVariant.config, probeExecution.executionId),
        config.executionTimeoutMs,
      );
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      appendEvent(probeExecution.executionId, "EXECUTION_FAILED", {
        error: reason,
        durationMs: 0,
      });
      appendEvent(probeExecution.executionId, "MUTATION_REJECTED", {
        variantId: mutantVariant.variantId,
        reason,
        reward: 0,
      });
      updateExecution(probeExecution.executionId, {
        status: "FAILED",
        completedAt: new Date().toISOString(),
        error: reason,
      });
      continue;
    }

    const { reward, metrics } = evaluateReward(probeMetrics, config.executionTimeoutMs);
    appendEvent(probeExecution.executionId, "REWARD_CALCULATED", { reward, metrics });
    recordReward(mutantVariant.variantId, reward);
    updateExecution(probeExecution.executionId, {
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      reward,
    });
    appendEvent(probeExecution.executionId, "EXECUTION_COMPLETED", {
      durationMs: probeMetrics.durationMs,
      reward,
    });

    if (reward >= config.rewardThreshold) {
      appendEvent(probeExecution.executionId, "MUTATION_APPLIED", {
        fromVariantId: candidateVariant.variantId,
        toVariantId: mutantVariant.variantId,
        delta,
      });
      candidateVariant = getVariant(mutantVariant.variantId)!;
      break;
    } else {
      appendEvent(probeExecution.executionId, "MUTATION_REJECTED", {
        variantId: mutantVariant.variantId,
        reason: `reward ${reward.toFixed(4)} < threshold ${config.rewardThreshold}`,
        reward,
      });
    }
  }

  // Run the actual production execution with the best candidate
  const execution = createExecution(candidateVariant.variantId, config.seed);
  appendEvent(execution.executionId, "EXECUTION_STARTED", {
    seed: config.seed,
    variantId: candidateVariant.variantId,
  });
  updateExecution(execution.executionId, { status: "RUNNING" });

  let finalMetrics: RewardMetrics;
  try {
    finalMetrics = await runWithTimeout(
      options.task(candidateVariant.config, execution.executionId),
      config.executionTimeoutMs,
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const isTimeout = reason === "EXECUTION_TIMEOUT";

    if (isTimeout) {
      appendEvent(execution.executionId, "EXECUTION_TIMEOUT", {
        timeoutMs: config.executionTimeoutMs,
      });
    } else {
      appendEvent(execution.executionId, "EXECUTION_FAILED", {
        error: reason,
        durationMs: 0,
      });
    }

    rollback(execution.executionId, candidateVariant.variantId, reason);
    return {
      executionId: execution.executionId,
      variantId: candidateVariant.variantId,
      reward: 0,
      status: "FAILED",
    };
  }

  const { reward, metrics } = evaluateReward(finalMetrics, config.executionTimeoutMs);
  appendEvent(execution.executionId, "REWARD_CALCULATED", { reward, metrics });
  recordReward(candidateVariant.variantId, reward);
  updateExecution(execution.executionId, {
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
    reward,
  });
  appendEvent(execution.executionId, "EXECUTION_COMPLETED", {
    durationMs: finalMetrics.durationMs,
    reward,
  });

  return {
    executionId: execution.executionId,
    variantId: candidateVariant.variantId,
    reward,
    status: "COMPLETED",
  };
}

/**
 * Run a promise with a hard timeout.
 * Rejects with an Error("EXECUTION_TIMEOUT") if exceeded.
 */
function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("EXECUTION_TIMEOUT"));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
