# MurMur-Core-Engine-Production-Runtime-
Stabil, deterministisk agent-loop med læring og rollback
core-engine/
├─ src/
│  ├─ agent/
│  │   runAgent.ts
│  │   evaluateReward.ts
│  │   mutation.ts
│  ├─ baseline/
│  │   applyBaseline.ts
│  │   rollback.ts
│  ├─ events/
│  │   appendEvent.ts
│  │   eventTypes.ts
│  ├─ state/
│  │   executionStore.ts
│  │   variantStore.ts
│  └─ config/
│      runtimeConfig.ts
│
├─ tests/
├─ docker/
├─ migrations/
└─ README.md
🔐 Production krav
	•	Deterministic execution seeds
	•	Transaction-safe state updates
	•	Append-only event log
	•	Versioned agent configs
	•	Hard execution timeout
	•	Safe rollback on failure

📊 Observability
	•	execution_id tracing
	•	reward distribution metrics
	•	mutation success rate
	•	baseline activation history

🧪 Testing
	•	unit → reward calc
	•	property tests → mutation stability
	•	replay test → same input = same output
	•	chaos test → forced crash recovery

🚀 Deploy
	•	Docker image
	•	Stateless runtime
	•	DB-backed state
	•	Horizontal scale allowed
