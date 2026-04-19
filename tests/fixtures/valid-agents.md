---
agent_id: "test-agent"
display_name: "Test Agent"
version: "1.0.0"
description: "A test agent used for validating the agents-md-kit parser and validator"
type: "mcp"
confidence_threshold: 0.9
---

# Test Agent

## What this is

This is a test agent used for unit and integration testing of agents-md-kit. It contains all required sections with valid content and serves as the baseline for validation tests.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐
│   MCP Client    │────▶│   Test Agent     │
│                 │     │                  │
└─────────────────┘     └──────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| **Server** | MCP server implementation |
| **Router** | Routes requests to skills |

## Skill System

| Skill ID | File | Description |
|----------|------|-------------|
| `echo` | `skills/echo/skill.md` | Echo back the input message |
| `transform` | `skills/transform/skill.md` | Transform input data |

## MCP Integration

### Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `echo` | `z.object({ message: z.string() })` | `{ echo: string }` | 60 RPM |
| `transform` | `z.object({ data: z.string(), format: z.string() })` | `{ result: string }` | 30 RPM |

### Example Request

```json
{
  "name": "echo",
  "arguments": {
    "message": "Hello, world!"
  }
}
```

## Security Considerations

### PII Handling

- Never log or store PII data
- Use placeholder values in examples
- Sanitize all user inputs before processing
- Access control enforced on all tool invocations

### Permissions

- All tools require authenticated sessions
- Rate limiting prevents abuse

## Observability

### Structured Logging

All operations emit structured JSON logs via pino:

```json
{
  "timestamp": "2026-04-15T00:00:00Z",
  "service": "test-agent",
  "operation": "echo",
  "duration_ms": 2,
  "success": true
}
```

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `test_agent.requests.total` | Counter | Total requests |
| `test_agent.requests.duration_ms` | Histogram | Latency |

## Checklist: Production Readiness

- [x] All required sections present
- [x] Skills documented
- [x] Security section covers PII
- [x] Observability section covers logging
- [x] No secrets in code
