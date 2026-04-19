---
agent_id: "example-classifier"
display_name: "Example Intent Classifier"
version: "1.0.0"
description: "A classifier agent that analyzes input and determines intent, confidence, and ambiguity"
type: "classifier"
confidence_threshold: 0.85
---

# Example Intent Classifier

## What this is

This is an example classifier agent that demonstrates how to analyze input text and determine intent, calculate confidence scores, and detect ambiguity for downstream routing or processing.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Input Text    │────▶│  Classifier      │────▶│   Intent       │
│                 │     │  Agent           │     │   + Confidence │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   Skills         │
                      │   (intent-       │
                      │    classification,│
                      │    confidence-    │
                      │    scoring,       │
                      │    ambiguity-     │
                      │    detection)     │
                      └──────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Classifier** | Main intent classification logic |
| **Intent Analyzer** | Determines the primary intent from input |
| **Confidence Scorer** | Calculates confidence in the classification |
| **Ambiguity Detector** | Identifies ambiguous or unclear inputs |

## Skill System

Classifier agents use the following skills:

| Skill ID | File | Description |
|----------|------|-------------|
| `intent-classification` | `skills/intent-classification/skill.md` | Primary intent determination |
| `confidence-scoring` | `skills/confidence-scoring/skill.md` | Confidence calculation |
| `ambiguity-detection` | `skills/ambiguity-detection/skill.md` | Ambiguity identification |

## MCP Integration

This agent exposes the following MCP tools:

### Tools

| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `classify` | `z.object({ text: z.string(), context: z.object().optional() })` | `{ intent: string, confidence: number, alternatives: array }` | Classify input text |
| `batch_classify` | `z.object({ texts: z.array(z.string()) })` | `{ results: array }` | Classify multiple texts |
| `get_intent_schema` | `z.object({ intent: z.string() })` | `{ schema: object, examples: array }` | Get intent definition |

### Example Request

```json
{
  "name": "classify",
  "arguments": {
    "text": "I want to cancel my subscription immediately",
    "context": {
      "channel": "support_chat"
    }
  }
}
```

### Example Response

```json
{
  "intent": "cancel_subscription",
  "confidence": 0.95,
  "alternatives": [
    { "intent": "billing_inquiry", "confidence": 0.72 },
    { "intent": "complaint", "confidence": 0.65 }
  ],
  "urgency": "high",
  "sentiment": "negative"
}
```

## Agent Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `CONFIDENCE_THRESHOLD` | Minimum confidence for auto-classification | `0.8` |
| `AMBIGUITY_THRESHOLD` | Score above which input is considered ambiguous | `0.5` |
| `MAX_ALTERNATIVES` | Maximum alternative intents to return | `3` |

## Security Considerations

### PII Handling

- **Never** store raw input text in logs
- Anonymize user identifiers in classification results
- Sanitize input before processing

### Input Validation

- Maximum input length enforced (10KB)
- Special characters are escaped
- Injection attempts are detected and blocked

## Error Handling

| Error Type | Recovery Strategy |
|------------|-------------------|
| Input too long | Truncate and classify with warning |
| Ambiguous input | Return low confidence, suggest clarification |
| Unknown intent | Return "unknown" intent with alternatives |
| Model error | Fall back to keyword-based classification |

## Observability

### Structured Logging

```json
{
  "timestamp": "2026-04-15T23:00:00Z",
  "service": "example-classifier",
  "operation": "classify",
  "intent": "cancel_subscription",
  "confidence": 0.95,
  "duration_ms": 45,
  "success": true
}
```

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `classifier.requests.total` | Counter | Total classification requests |
| `classifier.requests.duration_ms` | Histogram | Classification latency |
| `classifier.confidence.score` | Histogram | Confidence score distribution |
| `classifier.intents.detected` | Counter | Intent detection counts |

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

## Checklist: Production Readiness

- [x] All required sections present and documented
- [x] Skills directory contains all referenced skill files
- [x] Security section documents PII handling
- [x] Observability section documents logging approach
- [x] Error handling covers all failure modes
- [x] Tests pass with >80% coverage
- [x] No secrets or sensitive data in code or config
- [x] Environment variables documented
- [x] Rate limiting implemented
- [x] Health check endpoint available

## References

- [AGENTS.md Specification](https://github.com/reaatech/agents-md-kit)
- [Intent Classification Best Practices](https://example.com/intent-classification)
