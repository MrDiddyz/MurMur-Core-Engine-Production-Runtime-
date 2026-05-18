"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBaseline = applyBaseline;
const appendEvent_1 = require("../events/appendEvent");
const variantStore_1 = require("../state/variantStore");
/**
 * Activate the baseline variant for the given execution.
 * Emits a BASELINE_ACTIVATED event and returns the baseline variant ID.
 */
function applyBaseline(executionId) {
    const baseline = (0, variantStore_1.getBaselineVariant)();
    (0, appendEvent_1.appendEvent)(executionId, "BASELINE_ACTIVATED", {
        variantId: baseline.variantId,
    });
    return baseline.variantId;
}
//# sourceMappingURL=applyBaseline.js.map