"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAgent = runAgent;
const runtimeConfig_1 = require("../config/runtimeConfig");
const appendEvent_1 = require("../events/appendEvent");
const executionStore_1 = require("../state/executionStore");
const variantStore_1 = require("../state/variantStore");
const evaluateReward_1 = require("./evaluateReward");
const mutation_1 = require("./mutation");
const rollback_1 = require("../baseline/rollback");
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
async function runAgent(options) {
    const config = (0, runtimeConfig_1.loadRuntimeConfig)(options.configOverrides);
    // Ensure a baseline exists
    let activeVariant;
    try {
        activeVariant = (0, variantStore_1.getBaselineVariant)();
    }
    catch {
        // Auto-register a sensible default baseline on first run
        activeVariant = (0, variantStore_1.registerVariant)({ learningRate: 0.01, explorationRate: 0.1, discountFactor: 0.99 }, "1.0.0", true);
    }
    // Attempt to find a better mutant
    let candidateVariant = activeVariant;
    for (let attempt = 0; attempt < config.maxMutationAttempts; attempt++) {
        const { mutated, delta } = (0, mutation_1.mutateConfig)(candidateVariant.config, config.seed + attempt);
        const mutantVariant = (0, variantStore_1.registerVariant)(mutated, `${candidateVariant.version}-mut${attempt}`);
        const probeExecution = (0, executionStore_1.createExecution)(mutantVariant.variantId, config.seed + attempt);
        (0, appendEvent_1.appendEvent)(probeExecution.executionId, "EXECUTION_STARTED", {
            seed: config.seed + attempt,
            variantId: mutantVariant.variantId,
        });
        let probeMetrics;
        try {
            probeMetrics = await runWithTimeout(options.task(mutantVariant.config, probeExecution.executionId), config.executionTimeoutMs);
        }
        catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            (0, appendEvent_1.appendEvent)(probeExecution.executionId, "EXECUTION_FAILED", {
                error: reason,
                durationMs: 0,
            });
            (0, appendEvent_1.appendEvent)(probeExecution.executionId, "MUTATION_REJECTED", {
                variantId: mutantVariant.variantId,
                reason,
                reward: 0,
            });
            (0, executionStore_1.updateExecution)(probeExecution.executionId, {
                status: "FAILED",
                completedAt: new Date().toISOString(),
                error: reason,
            });
            continue;
        }
        const { reward, metrics } = (0, evaluateReward_1.evaluateReward)(probeMetrics, config.executionTimeoutMs);
        (0, appendEvent_1.appendEvent)(probeExecution.executionId, "REWARD_CALCULATED", { reward, metrics });
        (0, variantStore_1.recordReward)(mutantVariant.variantId, reward);
        (0, executionStore_1.updateExecution)(probeExecution.executionId, {
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
            reward,
        });
        (0, appendEvent_1.appendEvent)(probeExecution.executionId, "EXECUTION_COMPLETED", {
            durationMs: probeMetrics.durationMs,
            reward,
        });
        if (reward >= config.rewardThreshold) {
            (0, appendEvent_1.appendEvent)(probeExecution.executionId, "MUTATION_APPLIED", {
                fromVariantId: candidateVariant.variantId,
                toVariantId: mutantVariant.variantId,
                delta,
            });
            candidateVariant = (0, variantStore_1.getVariant)(mutantVariant.variantId);
            break;
        }
        else {
            (0, appendEvent_1.appendEvent)(probeExecution.executionId, "MUTATION_REJECTED", {
                variantId: mutantVariant.variantId,
                reason: `reward ${reward.toFixed(4)} < threshold ${config.rewardThreshold}`,
                reward,
            });
        }
    }
    // Run the actual production execution with the best candidate
    const execution = (0, executionStore_1.createExecution)(candidateVariant.variantId, config.seed);
    (0, appendEvent_1.appendEvent)(execution.executionId, "EXECUTION_STARTED", {
        seed: config.seed,
        variantId: candidateVariant.variantId,
    });
    (0, executionStore_1.updateExecution)(execution.executionId, { status: "RUNNING" });
    let finalMetrics;
    try {
        finalMetrics = await runWithTimeout(options.task(candidateVariant.config, execution.executionId), config.executionTimeoutMs);
    }
    catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        const isTimeout = reason === "EXECUTION_TIMEOUT";
        (0, appendEvent_1.appendEvent)(execution.executionId, isTimeout ? "EXECUTION_TIMEOUT" : "EXECUTION_FAILED", {
            ...(isTimeout ? { timeoutMs: config.executionTimeoutMs } : { error: reason, durationMs: 0 }),
        });
        (0, rollback_1.rollback)(execution.executionId, candidateVariant.variantId, reason);
        return {
            executionId: execution.executionId,
            variantId: candidateVariant.variantId,
            reward: 0,
            status: "FAILED",
        };
    }
    const { reward, metrics } = (0, evaluateReward_1.evaluateReward)(finalMetrics, config.executionTimeoutMs);
    (0, appendEvent_1.appendEvent)(execution.executionId, "REWARD_CALCULATED", { reward, metrics });
    (0, variantStore_1.recordReward)(candidateVariant.variantId, reward);
    (0, executionStore_1.updateExecution)(execution.executionId, {
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
        reward,
    });
    (0, appendEvent_1.appendEvent)(execution.executionId, "EXECUTION_COMPLETED", {
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
function runWithTimeout(promise, timeoutMs) {
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
//# sourceMappingURL=runAgent.js.map