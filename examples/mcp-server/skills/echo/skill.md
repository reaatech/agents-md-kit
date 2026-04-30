---
skill_id: "echo"
display_name: "Echo Skill"
version: "1.0.0"
description: "A basic echo skill that reflects input back with optional transformations"
category: "tool"
---

# Echo Skill

## Capability

A basic echo skill that reflects input back with optional transformations, useful for testing MCP connectivity and understanding the SKILL.md specification.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `echo` | `z.object({ message: z.string() })` | `{ echo: string }` | 120 RPM |
| `reverse` | `z.object({ text: z.string() })` | `{ reversed: string }` | 60 RPM |

### Tool: echo

Reflects the input message back to the caller.

**Input Schema:**

```typescript
z.object({
  message: z.string().describe('The message to echo back'),
  uppercase: z.boolean().optional().describe('Convert to uppercase'),
})
```

**Output:**

```typescript
{
  echo: string;
  timestamp: string;
}
```

### Tool: reverse

Reverses the input text character by character.

**Input Schema:**

```typescript
z.object({
  text: z.string().describe('The text to reverse'),
})
```

**Output:**

```typescript
{
  reversed: string;
  length: number;
}
```

## Usage Examples

### Success Case

```json
{
  "name": "echo",
  "arguments": {
    "message": "Hello, world!"
  }
}
```

**Response:**

```json
{
  "echo": "Hello, world!",
  "timestamp": "2026-04-15T23:00:00Z"
}
```

### Error Case

```json
{
  "name": "echo",
  "arguments": {
    "message": ""
  }
}
```

**Response:**

```json
{
  "error": "Message cannot be empty",
  "code": "VALIDATION_ERROR"
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `VALIDATION_ERROR` | Empty or invalid input | Return descriptive error message |
| `RATE_LIMIT_ERROR` | Too many requests | Queue and process later |
| `INTERNAL_ERROR` | Unexpected failure | Log and return generic error |

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "suggestions": ["Check input format"]
}
```

## Security Considerations

### Permissions

- This skill requires read access to input data
- No write permissions needed
- No admin permissions required

### PII Handling

- **Never** log raw input data that may contain PII
- Use anonymized identifiers in logs
- Sanitize outputs before returning

### Audit Logging

All skill invocations are logged with:
- Timestamp
- Skill ID
- Request ID (for tracing)
- Success/failure status
- Duration

## Testing

### Unit Tests

```bash
npm test -- tests/skills/echo.test.ts
```

### Integration Tests

```bash
npm run test:integration
```

## References

- [Skill Development Guide](../README.md)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Error Handling Best Practices](../docs/error-handling.md)
