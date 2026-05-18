"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutateConfig = mutateConfig;
/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Deterministic: same seed → same sequence.
 */
function mulberry32(seed) {
    let s = seed >>> 0;
    return () => {
        s += 0x6d2b79f5;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/**
 * Clamp a value within [min, max].
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Mutate an agent config, returning a new config and the diff (delta).
 * The mutation is deterministic given the seed.
 *
 * @param config  - The current agent config.
 * @param seed    - Deterministic seed for reproducibility.
 * @param scale   - Controls the magnitude of mutations (default 0.1).
 */
function mutateConfig(config, seed, scale = 0.1) {
    const rng = mulberry32(seed);
    const delta = {};
    const learningRate = clamp(config.learningRate + (rng() - 0.5) * 2 * scale, 0.0001, 1.0);
    const explorationRate = clamp(config.explorationRate + (rng() - 0.5) * 2 * scale, 0.0, 1.0);
    const discountFactor = clamp(config.discountFactor + (rng() - 0.5) * 2 * scale * 0.5, 0.0, 1.0);
    if (learningRate !== config.learningRate)
        delta.learningRate = learningRate;
    if (explorationRate !== config.explorationRate)
        delta.explorationRate = explorationRate;
    if (discountFactor !== config.discountFactor)
        delta.discountFactor = discountFactor;
    const mutated = {
        ...config,
        learningRate,
        explorationRate,
        discountFactor,
    };
    return { mutated, delta };
}
//# sourceMappingURL=mutation.js.map