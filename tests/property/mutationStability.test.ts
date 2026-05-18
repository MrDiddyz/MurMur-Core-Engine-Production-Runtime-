import { mutateConfig } from "../../src/agent/mutation";
import type { AgentConfig } from "../../src/state/variantStore";

const BASE_CONFIG: AgentConfig = {
  learningRate: 0.01,
  explorationRate: 0.1,
  discountFactor: 0.99,
};

describe("mutateConfig (property / mutation-stability)", () => {
  it("produces deterministic output for the same seed", () => {
    const r1 = mutateConfig(BASE_CONFIG, 42);
    const r2 = mutateConfig(BASE_CONFIG, 42);
    expect(r1.mutated).toEqual(r2.mutated);
    expect(r1.delta).toEqual(r2.delta);
  });

  it("produces different output for different seeds", () => {
    const r1 = mutateConfig(BASE_CONFIG, 1);
    const r2 = mutateConfig(BASE_CONFIG, 2);
    expect(r1.mutated).not.toEqual(r2.mutated);
  });

  it("keeps learningRate in (0, 1]", () => {
    for (let seed = 0; seed < 50; seed++) {
      const { mutated } = mutateConfig(BASE_CONFIG, seed);
      expect(mutated.learningRate).toBeGreaterThan(0);
      expect(mutated.learningRate).toBeLessThanOrEqual(1);
    }
  });

  it("keeps explorationRate in [0, 1]", () => {
    for (let seed = 0; seed < 50; seed++) {
      const { mutated } = mutateConfig(BASE_CONFIG, seed);
      expect(mutated.explorationRate).toBeGreaterThanOrEqual(0);
      expect(mutated.explorationRate).toBeLessThanOrEqual(1);
    }
  });

  it("keeps discountFactor in [0, 1]", () => {
    for (let seed = 0; seed < 50; seed++) {
      const { mutated } = mutateConfig(BASE_CONFIG, seed);
      expect(mutated.discountFactor).toBeGreaterThanOrEqual(0);
      expect(mutated.discountFactor).toBeLessThanOrEqual(1);
    }
  });

  it("delta only contains changed keys", () => {
    const { delta, mutated } = mutateConfig(BASE_CONFIG, 99);
    for (const [key, value] of Object.entries(delta)) {
      expect((mutated as Record<string, unknown>)[key]).toBe(value);
    }
  });

  it("does not mutate the original config object", () => {
    const original = { ...BASE_CONFIG };
    mutateConfig(BASE_CONFIG, 7);
    expect(BASE_CONFIG).toEqual(original);
  });
});
