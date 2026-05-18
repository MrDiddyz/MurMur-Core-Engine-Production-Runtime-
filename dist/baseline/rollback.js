"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rollback = rollback;
const appendEvent_1 = require("../events/appendEvent");
const executionStore_1 = require("../state/executionStore");
const applyBaseline_1 = require("./applyBaseline");
/**
 * Trigger a rollback for the given execution.
 * Emits ROLLBACK_TRIGGERED → ROLLBACK_COMPLETED events, updates the execution
 * record to FAILED, and switches back to the baseline variant.
 *
 * @param executionId      - The execution being rolled back.
 * @param currentVariantId - The variant that was active when the failure occurred.
 * @param reason           - Human-readable failure reason.
 */
function rollback(executionId, currentVariantId, reason) {
    (0, appendEvent_1.appendEvent)(executionId, "ROLLBACK_TRIGGERED", {
        fromVariantId: currentVariantId,
        reason,
    });
    // Switch execution back to the baseline
    const baselineVariantId = (0, applyBaseline_1.applyBaseline)(executionId);
    (0, executionStore_1.updateExecution)(executionId, {
        status: "FAILED",
        completedAt: new Date().toISOString(),
        error: reason,
        variantId: baselineVariantId,
    });
    (0, appendEvent_1.appendEvent)(executionId, "ROLLBACK_COMPLETED", {
        toVariantId: baselineVariantId,
    });
    return { executionId, rolledBackToVariantId: baselineVariantId };
}
//# sourceMappingURL=rollback.js.map