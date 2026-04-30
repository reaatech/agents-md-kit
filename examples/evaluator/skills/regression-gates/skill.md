---
skill_id: "regression-gates"
display_name: "Regression Gates Skill"
version: "1.0.0"
description: "Implements automated quality gates to block deployments with regressions"
category: "ci-cd"
---

# Regression Gates Skill

## Capability

Implements automated quality gates for CI/CD pipelines, comparing current model metrics against baselines and blocking deployments when regressions are detected.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `check_regression` | `z.object({ current_metrics: z.object(), baseline_metrics: z.object() })` | `{ passed: boolean, regressions: array, details: object }` | 50 RPM |
| `set_baseline` | `z.object({ metrics: z.object(), version: z.string() })` | `{ success: boolean, baseline_id: string }` | 10 RPM |
| `get_baseline` | `z.object({ version: z.string().optional() })` | `{ baseline: object, version: string }` | 60 RPM |
| `compare_versions` | `z.object({ current_version: z.string(), baseline_version: z.string() })` | `{ comparison: object, passed: boolean }` | 30 RPM |

### Tool: check_regression

Checks if current metrics represent a regression from baseline.

**Input Schema:**

```typescript
z.object({
  current_metrics: z.object({
    accuracy: z.number(),
    f1: z.number(),
    latency_p50: z.number(),
    latency_p99: z.number(),
    cost_per_request: z.number(),
  }),
  baseline_metrics: z.object({
    accuracy: z.number(),
    f1: z.number(),
    latency_p50: z.number(),
    latency_p99: z.number(),
    cost_per_request: z.number(),
  }),
})
```

**Output:**

```typescript
{
  passed: boolean;
  regressions: Array<{
    metric: string;
    baseline: number;
    current: number;
    change_pct: number;
    threshold_pct: number;
  }>;
  details: {
    improved: Array<{ metric: string; change_pct: number }>;
    degraded: Array<{ metric: string; change_pct: number }>;
  };
}
```

## Usage Examples

### Check for Regressions

**Request:**
```json
{
  "name": "check_regression",
  "arguments": {
    "current_metrics": {
      "accuracy": 0.82,
      "f1": 0.80,
      "latency_p50": 1500,
      "latency_p99": 3000,
      "cost_per_request": 0.012
    },
    "baseline_metrics": {
      "accuracy": 0.85,
      "f1": 0.84,
      "latency_p50": 1200,
      "latency_p99": 2500,
      "cost_per_request": 0.010
    }
  }
}
```

**Response (Regressions Detected):**
```json
{
  "passed": false,
  "regressions": [
    {
      "metric": "accuracy",
      "baseline": 0.85,
      "current": 0.82,
      "change_pct": -3.5,
      "threshold_pct": -2.0
    },
    {
      "metric": "latency_p50",
      "baseline": 1200,
      "current": 1500,
      "change_pct": 25.0,
      "threshold_pct": 10.0
    }
  ],
  "details": {
    "improved": [],
    "degraded": [
      { "metric": "accuracy", "change_pct": -3.5 },
      { "metric": "f1", "change_pct": -4.8 },
      { "metric": "latency_p50", "change_pct": 25.0 },
      { "metric": "latency_p99", "change_pct": 20.0 },
      { "metric": "cost_per_request", "change_pct": 20.0 }
    ]
  }
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `MISSING_METRICS` | Required metrics not provided | Return error with required fields |
| `INVALID_VALUES` | Metrics outside valid ranges | Clamp or return error |
| `NO_BASELINE` | Baseline not set | Use default thresholds |

## Gate Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `accuracy_min_delta` | Minimum accuracy change to flag | `-2%` |
| `latency_max_delta` | Maximum latency increase allowed | `10%` |
| `cost_max_delta` | Maximum cost increase allowed | `5%` |

## Security Considerations

- Baseline data is version-controlled
- Gate results are logged for audit
- Access to baseline modification is restricted

## Testing

```bash
npm test -- tests/skills/regression-gates.test.ts
