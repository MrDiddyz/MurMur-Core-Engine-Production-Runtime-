import { v4 as uuidv4 } from "uuid";

export type ExecutionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "TIMEOUT";

export interface ExecutionRecord {
  executionId: string;
  variantId: string;
  seed: number;
  status: ExecutionStatus;
  startedAt: string;
  completedAt: string | undefined;
  reward: number | undefined;
  error: string | undefined;
}

/** In-memory execution store (swap for a DB adapter in production). */
const store = new Map<string, ExecutionRecord>();

/** Create and persist a new execution record. */
export function createExecution(variantId: string, seed: number): ExecutionRecord {
  const record: ExecutionRecord = {
    executionId: uuidv4(),
    variantId,
    seed,
    status: "PENDING",
    startedAt: new Date().toISOString(),
    completedAt: undefined,
    reward: undefined,
    error: undefined,
  };
  store.set(record.executionId, record);
  return record;
}

/** Retrieve an execution by ID. Returns undefined if not found. */
export function getExecution(executionId: string): ExecutionRecord | undefined {
  return store.get(executionId);
}

/** Update an existing execution record (transaction-safe via Map). */
export function updateExecution(
  executionId: string,
  patch: Partial<Omit<ExecutionRecord, "executionId">>,
): ExecutionRecord {
  const existing = store.get(executionId);
  if (!existing) throw new Error(`Execution not found: ${executionId}`);
  const updated: ExecutionRecord = { ...existing, ...patch };
  store.set(executionId, updated);
  return updated;
}

/** Return all execution records (snapshot). */
export function getAllExecutions(): ReadonlyArray<ExecutionRecord> {
  return Array.from(store.values());
}

/** Clear the store. Use only in tests. */
export function _clearExecutionStore(): void {
  store.clear();
}
