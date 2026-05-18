/** All domain event types emitted by the engine. */
export type EventType = "EXECUTION_STARTED" | "EXECUTION_COMPLETED" | "EXECUTION_FAILED" | "EXECUTION_TIMEOUT" | "MUTATION_APPLIED" | "MUTATION_REJECTED" | "BASELINE_ACTIVATED" | "ROLLBACK_TRIGGERED" | "ROLLBACK_COMPLETED" | "REWARD_CALCULATED";
export interface BaseEvent {
    /** Unique event identifier. */
    id: string;
    /** ISO-8601 timestamp. */
    timestamp: string;
    /** Execution this event belongs to. */
    executionId: string;
    type: EventType;
}
export interface ExecutionStartedEvent extends BaseEvent {
    type: "EXECUTION_STARTED";
    payload: {
        seed: number;
        variantId: string;
    };
}
export interface ExecutionCompletedEvent extends BaseEvent {
    type: "EXECUTION_COMPLETED";
    payload: {
        durationMs: number;
        reward: number;
    };
}
export interface ExecutionFailedEvent extends BaseEvent {
    type: "EXECUTION_FAILED";
    payload: {
        error: string;
        durationMs: number;
    };
}
export interface ExecutionTimeoutEvent extends BaseEvent {
    type: "EXECUTION_TIMEOUT";
    payload: {
        timeoutMs: number;
    };
}
export interface MutationAppliedEvent extends BaseEvent {
    type: "MUTATION_APPLIED";
    payload: {
        fromVariantId: string;
        toVariantId: string;
        delta: Record<string, unknown>;
    };
}
export interface MutationRejectedEvent extends BaseEvent {
    type: "MUTATION_REJECTED";
    payload: {
        variantId: string;
        reason: string;
        reward: number;
    };
}
export interface BaselineActivatedEvent extends BaseEvent {
    type: "BASELINE_ACTIVATED";
    payload: {
        variantId: string;
    };
}
export interface RollbackTriggeredEvent extends BaseEvent {
    type: "ROLLBACK_TRIGGERED";
    payload: {
        fromVariantId: string;
        reason: string;
    };
}
export interface RollbackCompletedEvent extends BaseEvent {
    type: "ROLLBACK_COMPLETED";
    payload: {
        toVariantId: string;
    };
}
export interface RewardCalculatedEvent extends BaseEvent {
    type: "REWARD_CALCULATED";
    payload: {
        reward: number;
        metrics: Record<string, number>;
    };
}
export type EngineEvent = ExecutionStartedEvent | ExecutionCompletedEvent | ExecutionFailedEvent | ExecutionTimeoutEvent | MutationAppliedEvent | MutationRejectedEvent | BaselineActivatedEvent | RollbackTriggeredEvent | RollbackCompletedEvent | RewardCalculatedEvent;
//# sourceMappingURL=eventTypes.d.ts.map