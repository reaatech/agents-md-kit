---
agent_id: "example-orchestrator"
display_name: "Example Multi-Agent Orchestrator"
version: "1.0.0"
description: "An orchestrator agent that coordinates multiple specialized agents for complex workflows"
type: "orchestrator"
confidence_threshold: 0.8
---

# Example Multi-Agent Orchestrator

## What this is

This is an example orchestrator agent that demonstrates how to coordinate multiple specialized agents for complex workflows. It routes tasks to appropriate sub-agents, manages conversation state, and implements circuit breaker patterns for resilience.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Client        │────▶│  Orchestrator    │────▶│   Sub-Agent     │
│   Request       │     │  Agent           │     │   (Specialist)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   Skills         │
                      │   (routing,      │
                      │    circuit-      │
                      │    breaker,      │
                      │    session)      │
                      └──────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Orchestrator** | Main coordination logic and task routing |
| **Intent Router** | Determines which sub-agent should handle a request |
| **Circuit Breaker** | Prevents cascade failures when sub-agents are unavailable |
| **Session Manager** | Maintains conversation state across interactions |

## Skill System

Orchestrator agents use the following skills:

| Skill ID | File | Description |
|----------|------|-------------|
| `routing` | `skills/routing/skill.md` | Intent-based routing to sub-agents |
| `circuit-breaker` | `skills/circuit-breaker/skill.md` | Resilience pattern implementation |
| `session-management` | `skills/session-management/skill.md` | Conversation state management |

## MCP Integration

This agent exposes the following MCP tools:

### Tools

| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `orchestrate` | `z.object({ task: z.string(), context: z.object().optional() })` | `{ result: string, agent: string }` | Route and execute a task through sub-agents |
| `get_session` | `z.object({ session_id: z.string() })` | `{ session: object }` | Retrieve conversation state |
| `health_check` | `z.object({})` | `{ status: string, agents: object[] }` | Check health of all sub-agents |

### Example Request

```json
{
  "name": "orchestrate",
  "arguments": {
    "task": "Analyze this customer feedback and suggest improvements",
    "context": {
      "user_id": "user-123",
      "priority": "high"
    }
  }
}
```

### Example Response

```json
{
  "result": "Analysis complete: Customer satisfaction score 7/10. Recommended actions: improve response time, add self-service options.",
  "agent": "analyzer",
  "sub_results": [
    { "agent": "classifier", "result": "sentiment: neutral" },
    { "agent": "analyzer", "result": "topics: response-time, self-service" }
  ]
}
```

## Agent Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `CONFIDENCE_THRESHOLD` | Minimum confidence for routing decisions | `0.7` |
| `CIRCUIT_BREAKER_THRESHOLD` | Failure count before opening circuit | `5` |
| `SESSION_TTL_SECONDS` | Session time-to-live | `3600` |
| `TIMEOUT_MS` | Request timeout in milliseconds | `30000` |

## Security Considerations

### PII Handling

- **Never** log or store PII data in session state
- Use anonymized session IDs (UUID format)
- Sanitize all inputs before routing to sub-agents
- Implement rate limiting per session

### Authentication

- All orchestration requests require valid authentication
- Sub-agent communication uses internal service authentication
- Session tokens are encrypted at rest

### Authorization

- Users can only access their own session data
- Sub-agent access is controlled by routing policies
- Admin endpoints require elevated privileges

## Error Handling

| Error Type | Recovery Strategy |
|------------|-------------------|
| Sub-agent unavailable | Circuit breaker opens, return cached response or error |
| Routing ambiguity | Escalate to human operator or ask clarifying questions |
| Session expired | Create new session and notify user |
| Timeout | Return partial results if available, log for retry |

### Circuit Breaker States

| State | Behavior |
|-------|----------|
| `CLOSED` | Normal operation, all requests pass through |
| `OPEN` | Sub-agent unavailable, requests fail fast |
| `HALF_OPEN` | Testing if sub-agent recovered |

## Observability

### Structured Logging

All operations are logged with structured JSON:

```json
{
  "timestamp": "2026-04-15T23:00:00Z",
  "service": "example-orchestrator",
  "operation": "orchestrate",
  "session_id": "sess-abc123",
  "routing_decision": "analyzer",
  "confidence": 0.92,
  "duration_ms": 150,
  "success": true
}
```

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `orchestrator.requests.total` | Counter | Total requests processed |
| `orchestrator.requests.duration_ms` | Histogram | Request latency |
| `orchestrator.routing.decisions` | Counter | Routing decisions by agent |
| `orchestrator.circuit_breaker.state` | Gauge | Circuit breaker state per sub-agent |
| `orchestrator.sessions.active` | Gauge | Active sessions |

### Tracing

OpenTelemetry spans are created for each orchestration with full context propagation across sub-agents.

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Chaos Testing

```bash
npm run test:chaos
```

## Deployment

### Local Development

```bash
npm install
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Checklist: Production Readiness

- [x] All required sections present and documented
- [x] Skills directory contains all referenced skill files
- [x] Security section documents PII handling
- [x] Observability section documents logging approach
- [x] Error handling covers all failure modes
- [x] Circuit breaker implemented for resilience
- [x] Session management with proper TTL
- [x] Tests pass with >80% coverage
- [x] No secrets or sensitive data in code or config
- [x] Environment variables documented
- [x] Rate limiting implemented
- [x] Health check endpoint available

## References

- [AGENTS.md Specification](https://github.com/reaatech/agents-md-kit)
- [Orchestrator Pattern](https://example.com/orchestrator-pattern)
- [Circuit Breaker Pattern](https://example.com/circuit-breaker)
