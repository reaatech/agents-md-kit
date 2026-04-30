---
skill_id: "cost-optimization"
display_name: "Cost Optimization Skill"
version: "1.0.0"
description: "Routes requests to minimize inference costs while meeting quality requirements"
category: "optimization"
---

# Cost Optimization Skill

## Capability

Optimizes LLM routing decisions to minimize inference costs while maintaining acceptable quality thresholds.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `estimate_cost` | `z.object({ prompt_tokens: z.number(), model: z.string() })` | `{ cost_usd: number }` | 100 RPM |
| `find_cheapest_model` | `z.object({ min_quality: z.number(), max_latency_ms: z.number().optional() })` | `{ model: string, cost_usd: number }` | 50 RPM |
| `get_pricing` | `z.object({ provider: z.string().optional() })` | `{ pricing: array }` | 60 RPM |

### Tool: estimate_cost

Estimates the cost for a given prompt and model.

**Input Schema:**

```typescript
z.object({
  prompt_tokens: z.number().describe('Number of input tokens'),
  model: z.string().describe('Model identifier'),
})
```

**Output:**

```typescript
{
  cost_usd: number;
  breakdown: {
    input_cost: number;
    output_estimate: number;
  };
}
```

## Usage Examples

### Estimate Cost

**Request:**
```json
{
  "name": "estimate_cost",
  "arguments": {
    "prompt_tokens": 1000,
    "model": "gpt-4-turbo"
  }
}
```

**Response:**
```json
{
  "cost_usd": 0.013,
  "breakdown": {
    "input_cost": 0.01,
    "output_estimate": 0.003
  }
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `MODEL_NOT_FOUND` | Model not in pricing database | Return error with available models |
| `INVALID_TOKENS` | Negative or zero tokens | Return zero cost |

## Security Considerations

- Pricing data is cached and refreshed periodically
- No sensitive prompt data is logged

## Testing

```bash
npm test -- tests/skills/cost-optimization.test.ts
