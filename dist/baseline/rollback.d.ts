export interface RollbackResult {
    executionId: string;
    rolledBackToVariantId: string;
}
/**
 * Trigger a rollback for the given execution.
 * Emits ROLLBACK_TRIGGERED → ROLLBACK_COMPLETED events, updates the execution
 * record to FAILED, and switches back to the baseline variant.
 *
 * @param executionId      - The execution being rolled back.
 * @param currentVariantId - The variant that was active when the failure occurred.
 * @param reason           - Human-readable failure reason.
 */
export declare function rollback(executionId: string, currentVariantId: string, reason: string): RollbackResult;
//# sourceMappingURL=rollback.d.ts.map