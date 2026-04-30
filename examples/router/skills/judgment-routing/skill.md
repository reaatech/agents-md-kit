---
skill_id: "judgment-routing"
display_name: "Judgment Routing Skill"
version: "1.0.0"
description: "Determines when to escalate complex queries to more capable models"
category: "routing"
---

# Judgment Routing Skill

## Capability

Analyzes query complexity and determines when escalation to a more capable (and expensive) model is warranted for better quality results.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `assess_complexity` | `z.object({ prompt: z.string(), context: z.object().optional() })` | `{ complexity_score: number, needs_escalation: boolean }` | 100 RPM |
| `should_escalate` | `z.object({ prompt: z.string(), current_model: z.string() })` | `{ should_escalate: boolean, recommended_model: string, reason: string }` | 50 RPM |
| `get_escalation_threshold` | `z.object({})` | `{ threshold: number }` | 60 RPM |

### Tool: assess_complexity

Assesses the complexity of a query.

**Input Schema:**

```typescript
z.object({
  prompt: z.string().describe('The user prompt to assess'),
  context: z.object({
    domain: z.string().optional(),
    required_accuracy: z.number().optional(),
  }).optional(),
})
```

**Output:**

```typescript
{
  complexity_score: number;
  needs_escalation: boolean;
  factors: Array<{ factor: string; score: number }>;
}
```

## Usage Examples

### Assess Complex Query

**Request:**
```json
{
  "name": "assess_complexity",
  "arguments": {
    "prompt": "Analyze this legal contract and identify all clauses that may expose us to liability under California law, considering recent changes to employment regulations."
  }
}
```

**Response:**
```json
{
  "complexity_score": 0.92,
  "needs_escalation": true,
  "factors": [
    { "factor": "domain_specificity", "score": 0.95 },
    { "factor": "reasoning_depth", "score": 0.88 },
    { "factor": "context_length", "score": 0.75 }
  ]
}
```

### Assess Simple Query

**Request:**
```json
{
  "name": "assess_complexity",
  "arguments": {
    "prompt": "What is 2 + 2?"
  }
}
```

**Response:**
```json
{
  "complexity_score": 0.05,
  "needs_escalation": false,
  "factors": [
    { "factor": "domain_specificity", "score": 0.0 },
    { "factor": "reasoning_depth", "score": 0.1 },
    { "factor": "context_length", "score": 0.05 }
  ]
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `EMPTY_PROMPT` | Empty or whitespace-only prompt | Return zero complexity |
| `MODEL_NOT_FOUND` | Current model not in registry | Use default escalation path |

## Complexity Factors

| Factor | Description |
|--------|-------------|
| `domain_specificity` | Requires specialized knowledge |
| `reasoning_depth` | Multi-step reasoning required |
| `context_length` | Long context needed |
| `creativity_required` | Creative generation needed |
| `precision_required` | High accuracy critical |

## Security Considerations

- No prompt content is stored
- Complexity scores are cached for performance

## Testing

```bash
npm test -- tests/skills/judgment-routing.test.ts
