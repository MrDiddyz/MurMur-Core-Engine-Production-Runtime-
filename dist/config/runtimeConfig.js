"use strict";
/** Runtime configuration for the MurMur Core Engine. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadRuntimeConfig = loadRuntimeConfig;
const DEFAULT_CONFIG = {
    seed: 42,
    executionTimeoutMs: 30000,
    maxMutationAttempts: 5,
    rewardThreshold: 0.5,
    persistEvents: false,
    databaseUrl: undefined,
};
/**
 * Loads the runtime config, merging env-variable overrides on top of defaults.
 */
function loadRuntimeConfig(overrides = {}) {
    const env = {};
    if (process.env.ENGINE_SEED !== undefined) {
        const parsed = Number(process.env.ENGINE_SEED);
        if (!Number.isFinite(parsed))
            throw new Error("ENGINE_SEED must be a finite number");
        env.seed = parsed;
    }
    if (process.env.ENGINE_TIMEOUT_MS !== undefined) {
        const parsed = Number(process.env.ENGINE_TIMEOUT_MS);
        if (!Number.isFinite(parsed) || parsed <= 0)
            throw new Error("ENGINE_TIMEOUT_MS must be a positive number");
        env.executionTimeoutMs = parsed;
    }
    if (process.env.ENGINE_MAX_MUTATIONS !== undefined) {
        const parsed = Number(process.env.ENGINE_MAX_MUTATIONS);
        if (!Number.isInteger(parsed) || parsed < 1)
            throw new Error("ENGINE_MAX_MUTATIONS must be a positive integer");
        env.maxMutationAttempts = parsed;
    }
    if (process.env.ENGINE_REWARD_THRESHOLD !== undefined) {
        const parsed = Number(process.env.ENGINE_REWARD_THRESHOLD);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1)
            throw new Error("ENGINE_REWARD_THRESHOLD must be between 0 and 1");
        env.rewardThreshold = parsed;
    }
    if (process.env.ENGINE_PERSIST_EVENTS !== undefined) {
        env.persistEvents = process.env.ENGINE_PERSIST_EVENTS === "true";
    }
    if (process.env.DATABASE_URL !== undefined) {
        env.databaseUrl = process.env.DATABASE_URL;
    }
    return { ...DEFAULT_CONFIG, ...env, ...overrides };
}
//# sourceMappingURL=runtimeConfig.js.map