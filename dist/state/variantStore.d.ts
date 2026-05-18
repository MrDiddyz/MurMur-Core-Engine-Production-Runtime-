export interface AgentConfig {
    /** Arbitrary hyper-parameters for the agent. */
    learningRate: number;
    explorationRate: number;
    discountFactor: number;
    [key: string]: unknown;
}
export interface VariantRecord {
    variantId: string;
    /** Semantic version string, e.g. "1.0.0". */
    version: string;
    config: AgentConfig;
    isBaseline: boolean;
    createdAt: string;
    /** Total reward accumulated across all executions using this variant. */
    cumulativeReward: number;
    executionCount: number;
}
/** Register a new variant. Pass isBaseline=true to promote it immediately. */
export declare function registerVariant(config: AgentConfig, version: string, isBaseline?: boolean): VariantRecord;
/** Retrieve a variant by ID. */
export declare function getVariant(variantId: string): VariantRecord | undefined;
/** Return the current baseline variant. Throws if none is registered. */
export declare function getBaselineVariant(): VariantRecord;
/** Record a reward observation for a variant. */
export declare function recordReward(variantId: string, reward: number): VariantRecord;
/** Promote a variant to baseline. */
export declare function promoteToBaseline(variantId: string): VariantRecord;
/** Clear all variants. Use only in tests. */
export declare function _clearVariantStore(): void;
//# sourceMappingURL=variantStore.d.ts.map