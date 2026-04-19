---
skill_id: "intent-classification"
display_name: "Intent Classification Skill"
version: "1.0.0"
description: "Determines the primary intent from user input text"
category: "classification"
---

# Intent Classification Skill

## Capability

Analyzes user input text and determines the primary intent from a predefined set of intents, using a combination of ML models and rule-based matching.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `classify_intent` | `z.object({ text: z.string(), intents: z.array(z.string()).optional() })` | `{ intent: string, score: number }` | 100 RPM |
| `register_intent` | `z.object({ intent: z.string(), patterns: z.array(z.string()), examples: z.array(z.string()) })` | `{ success: boolean }` | 10 RPM |
| `list_intents` | `z.object({})` | `{ intents: array }` | 60 RPM |

### Tool: classify_intent

Determines the primary intent from input text.

**Input Schema:**

```typescript
z.object({
  text: z.string().describe('The user input text to classify'),
  intents: z.array(z.string()).optional().describe('Optional list of intents to consider'),
})
```

**Output:**

```typescript
{
  intent: string;
  score: number;
  all_scores: Array<{ intent: string; score: number }>;
  model_used: string;
}
```

## Usage Examples

### Classify Support Request

**Request:**
```json
{
  "name": "classify_intent",
  "arguments": {
    "text": "My account was charged twice this month"
  }
}
```

**Response:**
```json
{
  "intent": "billing_issue",
  "score": 0.92,
  "all_scores": [
    { "intent": "billing_issue", "score": 0.92 },
    { "intent": "refund_request", "score": 0.78 },
    { "intent": "account_inquiry", "score": 0.45 }
  ],
  "model_used": "transformer-v2"
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `EMPTY_INPUT` | Empty or whitespace-only text | Return "unknown" intent |
| `NO_INTENTS_REGISTERED` | No intents available for classification | Return error with registration instructions |
| `MODEL_ERROR` | ML model failure | Fall back to keyword matching |

## Security Considerations

### PII Handling

- Input text is processed in-memory only
- No raw text is persisted to logs
- Classification results are anonymized

## Testing

### Unit Tests

```bash
npm test -- tests/skills/intent-classification.test.ts
