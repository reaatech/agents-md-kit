---
skill_id: "circuit-breaker"
display_name: "Circuit Breaker Skill"
version: "1.0.0"
description: "Implements circuit breaker pattern for resilience against sub-agent failures"
category: "resilience"
---

# Circuit Breaker Skill

## Capability

Implements the circuit breaker pattern to prevent cascade failures when sub-agents are unavailable, providing graceful degradation and automatic recovery.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `check_circuit` | `z.object({ agent_id: z.string() })` | `{ state: string, failure_count: number }` | 100 RPM |
| `record_success` | `z.object({ agent_id: z.string() })` | `{ state: string }` | 100 RPM |
| `record_failure` | `z.object({ agent_id: z.string(), error_type: z.string().optional() })` | `{ state: string, should_fail_fast: boolean }` | 100 RPM |
| `reset_circuit` | `z.object({ agent_id: z.string() })` | `{ success: boolean }` | 10 RPM |

### Tool: check_circuit

Checks the current state of a circuit breaker for a specific agent.

**Input Schema:**

```typescript
z.object({
  agent_id: z.string().describe('The sub-agent identifier'),
})
```

**Output:**

```typescript
{
  agent_id: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failure_count: number;
  last_failure_time?: string;
  next_retry_time?: string;
}
```

## Usage Examples

### Check Circuit State

**Request:**
```json
{
  "name": "check_circuit",
  "arguments": {
    "agent_id": "sentiment-analyzer"
  }
}
```

**Response (Healthy):**
```json
{
  "agent_id": "sentiment-analyzer",
  "state": "CLOSED",
  "failure_count": 0
}
```

**Response (Open Circuit):**
```json
{
  "agent_id": "sentiment-analyzer",
  "state": "OPEN",
  "failure_count": 5,
  "last_failure_time": "2026-04-15T23:00:00Z",
  "next_retry_time": "2026-04-15T23:05:00Z"
}
```

### Record Failure

**Request:**
```json
{
  "name": "record_failure",
  "arguments": {
    "agent_id": "sentiment-analyzer",
    "error_type": "TIMEOUT"
  }
}
```

**Response (Circuit Opens):**
```json
{
  "state": "OPEN",
  "should_fail_fast": true,
  "failure_count": 5,
  "threshold_reached": true
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `AGENT_UNKNOWN` | Agent ID not registered | Return default CLOSED state |
| `STATE_TRANSITION_ERROR` | Invalid state transition | Log warning, maintain current state |

## Circuit Breaker Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `failure_threshold` | Failures before opening circuit | `5` |
| `recovery_timeout_ms` | Time before attempting recovery | `60000` |
| `success_threshold` | Successes needed to close circuit | `3` |

## Security Considerations

### Permissions

- Circuit breaker state changes are logged for audit
- Manual reset requires elevated privileges
- Configuration changes require admin access

### PII Handling

- No user data is stored in circuit breaker state
- Agent IDs are non-sensitive identifiers

## Testing

### Unit Tests

```bash
npm test -- tests/skills/circuit-breaker.test.ts
```

### Chaos Tests

```bash
npm run test:chaos
