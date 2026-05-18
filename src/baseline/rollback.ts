import { appendEvent } from "../events/appendEvent";
import { updateExecution } from "../state/executionStore";
import { applyBaseline } from "./applyBaseline";

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
export function rollback(
  executionId: string,
  currentVariantId: string,
  reason: string,
): RollbackResult {
  appendEvent(executionId, "ROLLBACK_TRIGGERED", {
    fromVariantId: currentVariantId,
    reason,
  });

  // Switch execution back to the baseline
  const baselineVariantId = applyBaseline(executionId);

  updateExecution(executionId, {
    status: "FAILED",
    completedAt: new Date().toISOString(),
    error: reason,
    variantId: baselineVariantId,
  });

  appendEvent(executionId, "ROLLBACK_COMPLETED", {
    toVariantId: baselineVariantId,
  });

  return { executionId, rolledBackToVariantId: baselineVariantId };
}
