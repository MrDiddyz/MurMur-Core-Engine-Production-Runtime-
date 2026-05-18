import { v4 as uuidv4 } from "uuid";
import type { EngineEvent, EventType } from "./eventTypes";

/** In-memory append-only event log (per process). */
const eventLog: EngineEvent[] = [];

/**
 * Append an event to the log. Events are immutable once written.
 *
 * @param executionId - The execution this event belongs to.
 * @param type        - The event type.
 * @param payload     - Type-specific payload (omit id/timestamp/executionId).
 * @returns The persisted event.
 */
export function appendEvent<T extends EngineEvent>(
  executionId: string,
  type: EventType,
  payload: T["payload"],
): T {
  const event = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    executionId,
    type,
    payload,
  } as T;

  eventLog.push(event);
  return event;
}

/**
 * Return a read-only snapshot of all events for a given execution.
 */
export function getEventsForExecution(executionId: string): ReadonlyArray<EngineEvent> {
  return eventLog.filter((e) => e.executionId === executionId);
}

/**
 * Return all stored events (used for replay / audit).
 */
export function getAllEvents(): ReadonlyArray<EngineEvent> {
  return [...eventLog];
}

/**
 * Clear the in-memory log. Use only in tests.
 */
export function _clearEventLog(): void {
  eventLog.length = 0;
}
