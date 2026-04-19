---
skill_id: "confidence-scoring"
display_name: "Confidence Scoring Skill"
version: "1.0.0"
description: "Calculates confidence scores for classification results"
category: "scoring"
---

# Confidence Scoring Skill

## Capability

Calculates and validates confidence scores for classification results, providing calibrated probability estimates and uncertainty quantification.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `calculate_confidence` | `z.object({ prediction: z.object(), model_id: z.string() })` | `{ confidence: number, calibrated: boolean }` | 100 RPM |
| `calibrate_scores` | `z.object({ scores: z.array(z.object({ label: z.string(), score: z.number() })) })` | `{ calibrated_scores: array }` | 50 RPM |
| `get_calibration_stats` | `z.object({ model_id: z.string() })` | `{ stats: object }` | 60 RPM |

### Tool: calculate_confidence

Calculates confidence score for a prediction.

**Input Schema:**

```typescript
z.object({
  prediction: z.object({
    label: z.string(),
    raw_score: z.number(),
    features: z.object().optional(),
  }),
  model_id: z.string().describe('Model identifier for calibration'),
})
```

**Output:**

```typescript
{
  confidence: number;
  calibrated: boolean;
  uncertainty: number;
  method: string;
}
```

## Usage Examples

### Calculate Calibrated Confidence

**Request:**
```json
{
  "name": "calculate_confidence",
  "arguments": {
    "prediction": {
      "label": "billing_issue",
      "raw_score": 0.87,
      "features": {
        "text_length": 45,
        "has_numbers": true
      }
    },
    "model_id": "intent-classifier-v2"
  }
}
```

**Response:**
```json
{
  "confidence": 0.82,
  "calibrated": true,
  "uncertainty": 0.12,
  "method": "isotonic_regression"
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `MODEL_NOT_FOUND` | Model ID not registered | Return raw score without calibration |
| `INVALID_SCORE` | Score outside [0, 1] range | Clamp to valid range |

## Security Considerations

### PII Handling

- No input data is stored
- Prediction features are processed in-memory only

## Testing

### Unit Tests

```bash
npm test -- tests/skills/confidence-scoring.test.ts
