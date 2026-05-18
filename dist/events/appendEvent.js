"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendEvent = appendEvent;
exports.getEventsForExecution = getEventsForExecution;
exports.getAllEvents = getAllEvents;
exports._clearEventLog = _clearEventLog;
const uuid_1 = require("uuid");
/** In-memory append-only event log (per process). */
const eventLog = [];
/**
 * Append an event to the log. Events are immutable once written.
 *
 * @param executionId - The execution this event belongs to.
 * @param type        - The event type.
 * @param payload     - Type-specific payload (omit id/timestamp/executionId).
 * @returns The persisted event.
 */
function appendEvent(executionId, type, payload) {
    const event = {
        id: (0, uuid_1.v4)(),
        timestamp: new Date().toISOString(),
        executionId,
        type,
        payload,
    };
    eventLog.push(event);
    return event;
}
/**
 * Return a read-only snapshot of all events for a given execution.
 */
function getEventsForExecution(executionId) {
    return eventLog.filter((e) => e.executionId === executionId);
}
/**
 * Return all stored events (used for replay / audit).
 */
function getAllEvents() {
    return [...eventLog];
}
/**
 * Clear the in-memory log. Use only in tests.
 */
function _clearEventLog() {
    eventLog.length = 0;
}
//# sourceMappingURL=appendEvent.js.map