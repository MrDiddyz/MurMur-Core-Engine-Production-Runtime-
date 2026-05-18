import { v4 as uuidv4 } from "uuid";

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

/** In-memory versioned variant store. */
const store = new Map<string, VariantRecord>();

/** Baseline variant ID — always set to the most recently promoted baseline. */
let baselineVariantId: string | undefined;

/** Register a new variant. Pass isBaseline=true to promote it immediately. */
export function registerVariant(
  config: AgentConfig,
  version: string,
  isBaseline = false,
): VariantRecord {
  const record: VariantRecord = {
    variantId: uuidv4(),
    version,
    config,
    isBaseline,
    createdAt: new Date().toISOString(),
    cumulativeReward: 0,
    executionCount: 0,
  };
  store.set(record.variantId, record);
  if (isBaseline) {
    // Demote previous baseline
    if (baselineVariantId) {
      const prev = store.get(baselineVariantId);
      if (prev) store.set(prev.variantId, { ...prev, isBaseline: false });
    }
    baselineVariantId = record.variantId;
  }
  return record;
}

/** Retrieve a variant by ID. */
export function getVariant(variantId: string): VariantRecord | undefined {
  return store.get(variantId);
}

/** Return the current baseline variant. Throws if none is registered. */
export function getBaselineVariant(): VariantRecord {
  if (!baselineVariantId) throw new Error("No baseline variant registered");
  const record = store.get(baselineVariantId);
  if (!record) throw new Error(`Baseline variant not found: ${baselineVariantId}`);
  return record;
}

/** Record a reward observation for a variant. */
export function recordReward(variantId: string, reward: number): VariantRecord {
  const record = store.get(variantId);
  if (!record) throw new Error(`Variant not found: ${variantId}`);
  const updated: VariantRecord = {
    ...record,
    cumulativeReward: record.cumulativeReward + reward,
    executionCount: record.executionCount + 1,
  };
  store.set(variantId, updated);
  return updated;
}

/** Promote a variant to baseline. */
export function promoteToBaseline(variantId: string): VariantRecord {
  const record = store.get(variantId);
  if (!record) throw new Error(`Variant not found: ${variantId}`);
  // Demote previous baseline
  if (baselineVariantId && baselineVariantId !== variantId) {
    const prev = store.get(baselineVariantId);
    if (prev) store.set(prev.variantId, { ...prev, isBaseline: false });
  }
  const updated = { ...record, isBaseline: true };
  store.set(variantId, updated);
  baselineVariantId = variantId;
  return updated;
}

/** Clear all variants. Use only in tests. */
export function _clearVariantStore(): void {
  store.clear();
  baselineVariantId = undefined;
}
