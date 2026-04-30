---
skill_id: "confusion-matrix"
display_name: "Confusion Matrix Skill"
version: "1.0.0"
description: "Calculates confusion matrix metrics for classification evaluation"
category: "metrics"
---

# Confusion Matrix Skill

## Capability

Computes confusion matrix and derived metrics (accuracy, precision, recall, F1) for classification model evaluation.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `compute_matrix` | `z.object({ predictions: z.array(z.string()), ground_truth: z.array(z.string()) })` | `{ matrix: object, metrics: object }` | 50 RPM |
| `compute_multiclass` | `z.object({ predictions: z.array(z.string()), ground_truth: z.array(z.string()), labels: z.array(z.string()) })` | `{ matrix: object, per_class: object, macro_avg: object }` | 30 RPM |
| `generate_report` | `z.object({ matrix: z.object() })` | `{ report: string, visualization: string }` | 20 RPM |

### Tool: compute_matrix

Computes confusion matrix for binary classification.

**Input Schema:**

```typescript
z.object({
  predictions: z.array(z.string()).describe('Predicted labels'),
  ground_truth: z.array(z.string()).describe('True labels'),
})
```

**Output:**

```typescript
{
  matrix: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  };
}
```

## Usage Examples

### Compute Binary Metrics

**Request:**
```json
{
  "name": "compute_matrix",
  "arguments": {
    "predictions": ["positive", "negative", "positive", "positive"],
    "ground_truth": ["positive", "negative", "negative", "positive"]
  }
}
```

**Response:**
```json
{
  "matrix": {
    "tp": 2,
    "tn": 1,
    "fp": 1,
    "fn": 0
  },
  "metrics": {
    "accuracy": 0.75,
    "precision": 0.67,
    "recall": 1.0,
    "f1": 0.8,
    "support": 4
  }
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `LENGTH_MISMATCH` | Predictions and ground truth have different lengths | Return error with counts |
| `EMPTY_INPUT` | No data provided | Return zero metrics |

## Security Considerations

- No data is persisted
- Metrics are computed in-memory

## Testing

```bash
npm test -- tests/skills/confusion-matrix.test.ts
