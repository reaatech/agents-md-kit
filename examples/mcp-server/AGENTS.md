---
agent_id: "example-mcp-server"
display_name: "Example MCP Server"
version: "1.0.0"
description: "A basic MCP server agent that demonstrates the AGENTS.md specification"
type: "mcp"
confidence_threshold: 0.8
---

# Example MCP Server

## What this is

This is an example MCP server agent that demonstrates the AGENTS.md specification. It provides basic echo and utility tools via the MCP protocol and serves as a reference implementation for building new agents with agents-md-kit.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   MCP Client    │────▶│  Example MCP     │────▶│   Tool         │
│   (Host)        │     │  Server          │     │   Execution    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   Skills         │
                      │   (echo, utils)  │
                      └──────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **MCP Server** | Stdio-based MCP server implementation |
| **Tool Router** | Routes requests to appropriate skills |
| **Echo Skill** | Basic echo tool for testing |
| **Utils Skill** | Utility tools (uppercase, lowercase, etc.) |

## Skill System

MCP server agents use the following skills:

| Skill ID | File | Description |
|----------|------|-------------|
| `echo` | `skills/echo/skill.md` | Basic echo and reflection skill |
| `utils` | `skills/utils/skill.md` | String utility operations |

## MCP Integration

This agent exposes the following MCP tools:

### Tools

| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `echo` | `z.object({ message: z.string() })` | `{ echo: string }` | Echo back the input message |
| `uppercase` | `z.object({ text: z.string() })` | `{ result: string }` | Convert text to uppercase |
| `lowercase` | `z.object({ text: z.string() })` | `{ result: string }` | Convert text to lowercase |

### Example Request

```json
{
  "name": "echo",
  "arguments": {
    "message": "Hello, world!"
  }
}
```

### Example Response

```json
{
  "echo": "Hello, world!"
}
```

## Agent Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `LOG_LEVEL` | Logging level (debug, info, warn, error) | `info` |
| `CONFIDENCE_THRESHOLD` | Minimum confidence for responses | `0.8` |
| `TIMEOUT_MS` | Request timeout in milliseconds | `30000` |

## Security Considerations

### PII Handling

- **Never** log or store PII data
- Use placeholder values in examples (e.g., `user-123`)
- Sanitize all user inputs before processing
- Implement rate limiting to prevent abuse

### Authentication

- All MCP tools require valid authentication
- Use API keys or OAuth tokens as appropriate
- Validate permissions before executing sensitive operations

## Error Handling

| Error Type | Recovery Strategy |
|------------|-------------------|
| Input validation failure | Return descriptive error with suggestions |
| Tool execution failure | Retry with backoff, then escalate |
| Timeout | Return partial results if available |
| Rate limit exceeded | Queue request and process when available |

## Observability

### Structured Logging

All operations are logged with structured JSON:

```json
{
  "timestamp": "2026-04-15T23:00:00Z",
  "service": "example-mcp-server",
  "operation": "echo",
  "duration_ms": 5,
  "success": true
}
```

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `example_mcp_server.requests.total` | Counter | Total requests processed |
| `example_mcp_server.requests.duration_ms` | Histogram | Request latency |
| `example_mcp_server.errors.total` | Counter | Total errors |

### Tracing

OpenTelemetry spans are created for each request with full context propagation.

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
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
- [x] Tests pass with >80% coverage
- [x] No secrets or sensitive data in code or config
- [x] Environment variables documented
- [x] Rate limiting implemented
- [x] Health check endpoint available

## References

- [AGENTS.md Specification](https://github.com/reaatech/agents-md-kit)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Skill Development Guide](./skills/echo/skill.md)
