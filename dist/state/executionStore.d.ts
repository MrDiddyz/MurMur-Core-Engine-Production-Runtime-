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
/** Create and persist a new execution record. */
export declare function createExecution(variantId: string, seed: number): ExecutionRecord;
/** Retrieve an execution by ID. Returns undefined if not found. */
export declare function getExecution(executionId: string): ExecutionRecord | undefined;
/** Update an existing execution record (transaction-safe via Map). */
export declare function updateExecution(executionId: string, patch: Partial<Omit<ExecutionRecord, "executionId">>): ExecutionRecord;
/** Return all execution records (snapshot). */
export declare function getAllExecutions(): ReadonlyArray<ExecutionRecord>;
/** Clear the store. Use only in tests. */
export declare function _clearExecutionStore(): void;
//# sourceMappingURL=executionStore.d.ts.map