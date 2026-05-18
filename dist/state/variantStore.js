"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVariant = registerVariant;
exports.getVariant = getVariant;
exports.getBaselineVariant = getBaselineVariant;
exports.recordReward = recordReward;
exports.promoteToBaseline = promoteToBaseline;
exports._clearVariantStore = _clearVariantStore;
const uuid_1 = require("uuid");
/** In-memory versioned variant store. */
const store = new Map();
/** Baseline variant ID — always set to the most recently promoted baseline. */
let baselineVariantId;
/** Register a new variant. Pass isBaseline=true to promote it immediately. */
function registerVariant(config, version, isBaseline = false) {
    const record = {
        variantId: (0, uuid_1.v4)(),
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
            if (prev)
                store.set(prev.variantId, { ...prev, isBaseline: false });
        }
        baselineVariantId = record.variantId;
    }
    return record;
}
/** Retrieve a variant by ID. */
function getVariant(variantId) {
    return store.get(variantId);
}
/** Return the current baseline variant. Throws if none is registered. */
function getBaselineVariant() {
    if (!baselineVariantId)
        throw new Error("No baseline variant registered");
    const record = store.get(baselineVariantId);
    if (!record)
        throw new Error(`Baseline variant not found: ${baselineVariantId}`);
    return record;
}
/** Record a reward observation for a variant. */
function recordReward(variantId, reward) {
    const record = store.get(variantId);
    if (!record)
        throw new Error(`Variant not found: ${variantId}`);
    const updated = {
        ...record,
        cumulativeReward: record.cumulativeReward + reward,
        executionCount: record.executionCount + 1,
    };
    store.set(variantId, updated);
    return updated;
}
/** Promote a variant to baseline. */
function promoteToBaseline(variantId) {
    const record = store.get(variantId);
    if (!record)
        throw new Error(`Variant not found: ${variantId}`);
    // Demote previous baseline
    if (baselineVariantId && baselineVariantId !== variantId) {
        const prev = store.get(baselineVariantId);
        if (prev)
            store.set(prev.variantId, { ...prev, isBaseline: false });
    }
    const updated = { ...record, isBaseline: true };
    store.set(variantId, updated);
    baselineVariantId = variantId;
    return updated;
}
/** Clear all variants. Use only in tests. */
function _clearVariantStore() {
    store.clear();
    baselineVariantId = undefined;
}
//# sourceMappingURL=variantStore.js.map