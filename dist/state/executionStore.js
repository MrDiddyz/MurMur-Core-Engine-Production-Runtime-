"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExecution = createExecution;
exports.getExecution = getExecution;
exports.updateExecution = updateExecution;
exports.getAllExecutions = getAllExecutions;
exports._clearExecutionStore = _clearExecutionStore;
const uuid_1 = require("uuid");
/** In-memory execution store (swap for a DB adapter in production). */
const store = new Map();
/** Create and persist a new execution record. */
function createExecution(variantId, seed) {
    const record = {
        executionId: (0, uuid_1.v4)(),
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
function getExecution(executionId) {
    return store.get(executionId);
}
/** Update an existing execution record (transaction-safe via Map). */
function updateExecution(executionId, patch) {
    const existing = store.get(executionId);
    if (!existing)
        throw new Error(`Execution not found: ${executionId}`);
    const updated = { ...existing, ...patch };
    store.set(executionId, updated);
    return updated;
}
/** Return all execution records (snapshot). */
function getAllExecutions() {
    return Array.from(store.values());
}
/** Clear the store. Use only in tests. */
function _clearExecutionStore() {
    store.clear();
}
//# sourceMappingURL=executionStore.js.map