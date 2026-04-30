# @reaatech/agents-markdown-observability

[![npm version](https://img.shields.io/npm/v/@reaatech/agents-markdown-observability.svg)](https://www.npmjs.com/package/@reaatech/agents-markdown-observability)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/reaatech/agents-md-kit/ci.yml?branch=main&label=CI)](https://github.com/reaatech/agents-md-kit/actions/workflows/ci.yml)

> **Status:** Pre-1.0 — APIs may change in minor versions. Pin to a specific version in production.

Structured logging via [Pino](https://getpino.io/), OpenTelemetry tracing and metrics, and dashboard aggregation for the `@reaatech/agents-markdown-*` ecosystem.

## Installation

```bash
npm install @reaatech/agents-markdown-observability
# or
pnpm add @reaatech/agents-markdown-observability
```

## Feature Overview

- **Structured logging** — Pino-based JSON logging with PII redaction, request IDs, and severity levels
- **OpenTelemetry metrics** — Counters for operations, validation errors, lint warnings, files processed, and scaffold generations; histograms for operation duration
- **Timed operation wrapper** — `recordOperation` wraps any async function with automatic duration tracking
- **Dashboard aggregation** — `buildDashboardSummary` and `renderDashboardMarkdown` for at-a-glance observability
- **Singleton metrics manager** — Shared `MetricsManager` across the process lifetime

## Quick Start

```typescript
import {
  info,
  error,
  recordOperation,
  buildDashboardSummary,
  renderDashboardMarkdown,
} from "@reaatech/agents-markdown-observability";

info("lint", "Linting AGENTS.md", { path: "./AGENTS.md" });

const result = await recordOperation("lint", async () => {
  // Your lint logic here — duration is automatically recorded
  return lintResult;
});

error("validate", "Validation failed", {
  path: "./AGENTS.md",
  errorCount: 3,
  warningCount: 2,
});
```

## API Reference

### Logging

All convenience loggers produce structured JSON logs via Pino. They accept an operation name, a message, and an optional data object.

```typescript
function info(operation: string, message: string, data?: Record<string, unknown>): void
function error(operation: string, message: string, data?: Record<string, unknown>): void
function warn(operation: string, message: string, data?: Record<string, unknown>): void
function debug(operation: string, message: string, data?: Record<string, unknown>): void
```

#### `log(entry)`

Low-level structured log with explicit `LogEntry` shape. Applies PII redaction.

```typescript
interface LogEntry {
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARN" | "ERROR";
  service: string;
  operation: string;
  message: string;
  duration_ms?: number;
  success?: boolean;
  errors?: number;
  warnings?: number;
  request_id?: string;
}

function log(entry: LogEntry): void
```

#### `setLogger(logger)`

Replace the Pino logger instance for custom transport/level configuration.

### Metrics

#### `recordOperation(operation, fn)`

Timed operation wrapper. Records operation count and duration histogram. Returns the function's result.

```typescript
type OperationType = "parse" | "validate" | "lint" | "scaffold" | "format" | "report";

async function recordOperation<T>(
  operation: OperationType,
  fn: () => Promise<T>
): Promise<T>
```

#### `MetricsManager`

Singleton accessor and class. Records counters and histograms via OpenTelemetry.

```typescript
class MetricsManager {
  recordOperation(operation: OperationType, durationMs: number): void;
  recordValidationErrors(count: number): void;
  recordValidationWarnings(count: number): void;
  recordLintErrors(count: number): void;
  recordLintWarnings(count: number): void;
  recordFileProcessed(count: number): void;
  recordScaffoldGeneration(count: number): void;
  shutdown(): Promise<void>;
}

function getMetricsManager(): MetricsManager
```

#### `METRIC_NAMES`

Exported constants for all 8 metric names:

| Constant | Metric |
|----------|--------|
| `OPERATIONS_TOTAL` | Counter: total operations by type |
| `OPERATIONS_DURATION_MS` | Histogram: operation latency |
| `VALIDATION_ERRORS` | Counter: validation errors found |
| `VALIDATION_WARNINGS` | Counter: validation warnings found |
| `LINTING_ERRORS` | Counter: lint errors found |
| `LINTING_WARNINGS` | Counter: lint warnings found |
| `FILES_PROCESSED` | Counter: files processed |
| `SCAFFOLD_GENERATIONS` | Counter: scaffold generations |

### Dashboard

```typescript
interface DashboardSummary {
  totalOperations: number;
  failures: number;
  averageDurationMs: number;
  operationsByName: Record<string, number>;
  errorsByOperation: Record<string, number>;
}
```

| Function | Description |
|----------|-------------|
| `buildDashboardSummary(entries: LogEntry[])` | Aggregate log entries into a summary |
| `renderDashboardMarkdown(summary: DashboardSummary)` | Render summary as GitHub-flavored markdown |

## Related Packages

- [`@reaatech/agents-markdown`](https://www.npmjs.com/package/@reaatech/agents-markdown) — Core types

## License

[MIT](https://github.com/reaatech/agents-md-kit/blob/main/LICENSE)
