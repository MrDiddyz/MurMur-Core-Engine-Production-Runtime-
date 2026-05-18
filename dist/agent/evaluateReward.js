"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateReward = evaluateReward;
/**
 * Evaluate the reward for a completed execution.
 *
 * Formula (deterministic given same inputs):
 *   successRate = successSteps / max(1, totalSteps)
 *   speedBonus  = clamp(1 - durationMs / timeoutMs, 0, 1) * 0.2
 *   reward      = successRate * 0.8 + speedBonus
 *
 * @param metrics    - Raw execution metrics.
 * @param timeoutMs  - The configured execution timeout (for speed normalisation).
 */
function evaluateReward(metrics, timeoutMs) {
    if (timeoutMs <= 0)
        throw new Error("timeoutMs must be positive");
    const totalSteps = metrics.successSteps + metrics.failureSteps;
    if (totalSteps === 0) {
        return {
            reward: 0,
            metrics: { successSteps: 0, failureSteps: 0, totalSteps: 0, successRate: 0, speedBonus: 0, durationMs: metrics.durationMs, ...(metrics.custom ?? {}) },
        };
    }
    const successRate = metrics.successSteps / totalSteps;
    const rawSpeedBonus = 1 - metrics.durationMs / timeoutMs;
    const speedBonus = Math.max(0, Math.min(1, rawSpeedBonus)) * 0.2;
    const reward = Math.max(0, Math.min(1, successRate * 0.8 + speedBonus));
    const aggregatedMetrics = {
        successSteps: metrics.successSteps,
        failureSteps: metrics.failureSteps,
        totalSteps,
        successRate,
        speedBonus,
        durationMs: metrics.durationMs,
        ...(metrics.custom ?? {}),
    };
    return { reward, metrics: aggregatedMetrics };
}
//# sourceMappingURL=evaluateReward.js.map