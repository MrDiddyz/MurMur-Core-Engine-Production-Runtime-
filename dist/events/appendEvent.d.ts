import type { EngineEvent, EventType } from "./eventTypes";
/**
 * Append an event to the log. Events are immutable once written.
 *
 * @param executionId - The execution this event belongs to.
 * @param type        - The event type.
 * @param payload     - Type-specific payload (omit id/timestamp/executionId).
 * @returns The persisted event.
 */
export declare function appendEvent<T extends EngineEvent>(executionId: string, type: EventType, payload: T["payload"]): T;
/**
 * Return a read-only snapshot of all events for a given execution.
 */
export declare function getEventsForExecution(executionId: string): ReadonlyArray<EngineEvent>;
/**
 * Return all stored events (used for replay / audit).
 */
export declare function getAllEvents(): ReadonlyArray<EngineEvent>;
/**
 * Clear the in-memory log. Use only in tests.
 */
export declare function _clearEventLog(): void;
//# sourceMappingURL=appendEvent.d.ts.map