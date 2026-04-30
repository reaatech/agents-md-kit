---
skill_id: "routing"
display_name: "Intent Routing Skill"
version: "1.0.0"
description: "Routes tasks to appropriate sub-agents based on intent classification"
category: "orchestration"
---

# Intent Routing Skill

## Capability

Routes incoming tasks to the most appropriate sub-agent based on intent analysis, confidence scoring, and routing policies.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `route_task` | `z.object({ task: z.string(), context: z.object().optional() })` | `{ agent: string, confidence: number }` | 100 RPM |
| `update_routing_rules` | `z.object({ rules: z.array(z.object({ pattern: z.string(), agent: z.string() })) })` | `{ updated: number }` | 10 RPM |
| `get_routing_stats` | `z.object({})` | `{ stats: object }` | 60 RPM |

### Tool: route_task

Analyzes task intent and determines the best sub-agent to handle it.

**Input Schema:**

```typescript
z.object({
  task: z.string().describe('The task description to route'),
  context: z.object({
    user_id: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    preferred_agent: z.string().optional(),
  }).optional(),
})
```

**Output:**

```typescript
{
  agent: string;
  confidence: number;
  alternatives: Array<{ agent: string; confidence: number }>;
  reasoning: string;
}
```

## Usage Examples

### Success Case

**Request:**
```json
{
  "name": "route_task",
  "arguments": {
    "task": "Analyze customer sentiment in this feedback: 'The response time was too slow'",
    "context": {
      "priority": "high"
    }
  }
}
```

**Response:**
```json
{
  "agent": "sentiment-analyzer",
  "confidence": 0.94,
  "alternatives": [
    { "agent": "topic-classifier", "confidence": 0.72 },
    { "agent": "urgency-detector", "confidence": 0.68 }
  ],
  "reasoning": "Task contains explicit sentiment analysis request with negative feedback about response time"
}
```

### Ambiguous Task (Low Confidence)

**Request:**
```json
{
  "name": "route_task",
  "arguments": {
    "task": "Help me with this"
  }
}
```

**Response:**
```json
{
  "agent": "general-assistant",
  "confidence": 0.35,
  "alternatives": [],
  "reasoning": "Task too vague, routing to general assistant for clarification",
  "needs_clarification": true
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `NO_SUITABLE_AGENT` | No agent matches the task intent | Route to fallback agent or request clarification |
| `ROUTING_LOOP` | Task keeps bouncing between agents | Break loop and escalate to human |
| `AGENT_UNAVAILABLE` | Target agent is down | Use circuit breaker, try alternative |

## Security Considerations

### Permissions

- Routing decisions are logged for audit purposes
- Routing rules can only be updated by authorized users
- Task content is sanitized before analysis

### PII Handling

- Task content is processed in-memory only
- No task data is persisted in logs
- User context is anonymized

## Testing

### Unit Tests

```bash
npm test -- tests/skills/routing.test.ts
```

### Integration Tests

```bash
npm run test:integration
