---
skill_id: "ambiguity-detection"
display_name: "Ambiguity Detection Skill"
version: "1.0.0"
description: "Detects ambiguous or unclear input that may require clarification"
category: "detection"
---

# Ambiguity Detection Skill

## Capability

Analyzes input text to detect ambiguity, vagueness, or insufficient information that would benefit from clarification before processing.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `detect_ambiguity` | `z.object({ text: z.string(), context: z.object().optional() })` | `{ is_ambiguous: boolean, score: number, reasons: array }` | 100 RPM |
| `suggest_clarification` | `z.object({ text: z.string(), ambiguity_reasons: z.array(z.string()) })` | `{ questions: array }` | 50 RPM |
| `get_ambiguity_threshold` | `z.object({})` | `{ threshold: number }` | 60 RPM |

### Tool: detect_ambiguity

Detects ambiguity in input text.

**Input Schema:**

```typescript
z.object({
  text: z.string().describe('The input text to analyze'),
  context: z.object({
    domain: z.string().optional(),
    previous_turns: z.array(z.object()).optional(),
  }).optional(),
})
```

**Output:**

```typescript
{
  is_ambiguous: boolean;
  score: number;
  reasons: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
  needs_clarification: boolean;
}
```

## Usage Examples

### Detect Ambiguous Request

**Request:**
```json
{
  "name": "detect_ambiguity",
  "arguments": {
    "text": "I need help with my account"
  }
}
```

**Response:**
```json
{
  "is_ambiguous": true,
  "score": 0.85,
  "reasons": [
    {
      "type": "vague_request",
      "description": "Request lacks specific details about the issue",
      "confidence": 0.92
    },
    {
      "type": "missing_context",
      "description": "No indication of what type of help is needed",
      "confidence": 0.78
    }
  ],
  "needs_clarification": true
}
```

### Detect Clear Request

**Request:**
```json
{
  "name": "detect_ambiguity",
  "arguments": {
    "text": "I want to change my billing address from 123 Main St to 456 Oak Ave"
  }
}
```

**Response:**
```json
{
  "is_ambiguous": false,
  "score": 0.12,
  "reasons": [],
  "needs_clarification": false
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `EMPTY_INPUT` | Empty or whitespace-only text | Return high ambiguity score |
| `LANGUAGE_NOT_SUPPORTED` | Text in unsupported language | Return neutral score with warning |

## Ambiguity Types

| Type | Description |
|------|-------------|
| `vague_request` | Request lacks specific details |
| `missing_context` | Insufficient context for action |
| `pronoun_ambiguity` | Unclear pronoun references |
| `multiple_intents` | Text could match multiple intents |
| `contradiction` | Conflicting information in text |

## Security Considerations

### PII Handling

- Input text is processed in-memory only
- No text data is persisted to logs
- Analysis results are anonymized

## Testing

### Unit Tests

```bash
npm test -- tests/skills/ambiguity-detection.test.ts
