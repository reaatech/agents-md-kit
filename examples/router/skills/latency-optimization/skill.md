---
skill_id: "latency-optimization"
display_name: "Latency Optimization Skill"
version: "1.0.0"
description: "Routes requests to minimize response latency based on real-time provider performance"
category: "optimization"
---

# Latency Optimization Skill

## Capability

Optimizes LLM routing decisions to minimize response latency by monitoring real-time provider performance and selecting the fastest available option.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `get_fastest_provider` | `z.object({ model_requirements: z.array(z.string()).optional() })` | `{ provider: string, model: string, estimated_latency_ms: number }` | 100 RPM |
| `record_latency` | `z.object({ provider: z.string(), model: z.string(), latency_ms: number })` | `{ updated: boolean }` | 100 RPM |
| `get_latency_stats` | `z.object({ provider: z.string().optional() })` | `{ stats: array }` | 60 RPM |

### Tool: get_fastest_provider

Finds the fastest available provider for the given requirements.

**Input Schema:**

```typescript
z.object({
  model_requirements: z.array(z.string()).optional().describe('Required model capabilities'),
})
```

**Output:**

```typescript
{
  provider: string;
  model: string;
  estimated_latency_ms: number;
  confidence: number;
}
```

## Usage Examples

### Get Fastest Provider

**Request:**
```json
{
  "name": "get_fastest_provider",
  "arguments": {
    "model_requirements": ["chat", "function-calling"]
  }
}
```

**Response:**
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo",
  "estimated_latency_ms": 1250,
  "confidence": 0.92
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `NO_AVAILABLE_PROVIDERS` | All providers unavailable | Return error with retry suggestion |
| `INSUFFICIENT_DATA` | Not enough latency data | Use historical averages |

## Security Considerations

- Latency data is aggregated and anonymized
- No prompt content is stored

## Testing

```bash
npm test -- tests/skills/latency-optimization.test.ts
