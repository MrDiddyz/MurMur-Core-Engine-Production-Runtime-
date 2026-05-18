import type { AgentConfig } from "../state/variantStore";
export interface MutationDelta {
    [key: string]: unknown;
}
/**
 * Mutate an agent config, returning a new config and the diff (delta).
 * The mutation is deterministic given the seed.
 *
 * @param config  - The current agent config.
 * @param seed    - Deterministic seed for reproducibility.
 * @param scale   - Controls the magnitude of mutations (default 0.1).
 */
export declare function mutateConfig(config: AgentConfig, seed: number, scale?: number): {
    mutated: AgentConfig;
    delta: MutationDelta;
};
//# sourceMappingURL=mutation.d.ts.map