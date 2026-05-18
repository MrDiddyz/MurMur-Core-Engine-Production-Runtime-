import { type RuntimeConfig } from "../config/runtimeConfig";
import { type ExecutionRecord } from "../state/executionStore";
import { type AgentConfig } from "../state/variantStore";
import { type RewardMetrics } from "./evaluateReward";
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
export declare function runAgent(options: AgentRunOptions): Promise<AgentRunResult>;
//# sourceMappingURL=runAgent.d.ts.map