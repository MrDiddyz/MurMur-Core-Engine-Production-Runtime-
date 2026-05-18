import { appendEvent } from "../events/appendEvent";
import { getBaselineVariant } from "../state/variantStore";

/**
 * Activate the baseline variant for the given execution.
 * Emits a BASELINE_ACTIVATED event and returns the baseline variant ID.
 */
export function applyBaseline(executionId: string): string {
  const baseline = getBaselineVariant();

  appendEvent(executionId, "BASELINE_ACTIVATED", {
    variantId: baseline.variantId,
  });

  return baseline.variantId;
}
