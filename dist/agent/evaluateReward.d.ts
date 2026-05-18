export interface RewardMetrics {
    /** Number of successful steps completed. */
    successSteps: number;
    /** Number of failed steps. */
    failureSteps: number;
    /** Wall-clock execution time in milliseconds. */
    durationMs: number;
    /** Optional user-defined metrics. */
    custom?: Record<string, number>;
}
export interface RewardResult {
    /** Normalised reward in [0, 1]. */
    reward: number;
    metrics: Record<string, number>;
}
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
export declare function evaluateReward(metrics: RewardMetrics, timeoutMs: number): RewardResult;
//# sourceMappingURL=evaluateReward.d.ts.map