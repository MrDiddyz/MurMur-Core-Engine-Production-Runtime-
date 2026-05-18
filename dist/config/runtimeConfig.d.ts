/** Runtime configuration for the MurMur Core Engine. */
export interface RuntimeConfig {
    /** Deterministic seed for reproducible execution. */
    seed: number;
    /** Maximum execution time in milliseconds before hard timeout. */
    executionTimeoutMs: number;
    /** Maximum number of mutation attempts before falling back to baseline. */
    maxMutationAttempts: number;
    /** Minimum reward threshold to accept a mutated variant. */
    rewardThreshold: number;
    /** Whether to persist events to an external store. */
    persistEvents: boolean;
    /** Database connection string (used when persistEvents = true). */
    databaseUrl: string | undefined;
}
/**
 * Loads the runtime config, merging env-variable overrides on top of defaults.
 */
export declare function loadRuntimeConfig(overrides?: Partial<RuntimeConfig>): RuntimeConfig;
//# sourceMappingURL=runtimeConfig.d.ts.map