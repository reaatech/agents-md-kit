---
skill_id: 'test-echo'
display_name: 'Test Echo Skill'
version: '1.0.0'
description: 'A test echo skill used for validating the agents-md-kit parser and validator'
category: 'tool'
---

# Test Echo Skill

## Capability

Echoes back the input message, optionally transforming it. Used for testing connectivity and validating the MCP tool pipeline.

## MCP Tools

| Tool         | Input Schema                        | Output             | Rate Limit |
| ------------ | ----------------------------------- | ------------------ | ---------- |
| `echo`       | `z.object({ message: z.string() })` | `{ echo: string }` | 60 RPM     |
| `echo_upper` | `z.object({ message: z.string() })` | `{ echo: string }` | 60 RPM     |

## Usage Examples

### Success Case

**Request:**

```json
{
  "name": "echo",
  "arguments": { "message": "Hello" }
}
```

**Expected Response:**

```json
{
  "echo": "Hello"
}
```

### Error Case

**Request with missing field:**

```json
{
  "name": "echo",
  "arguments": {}
}
```

**Error Response:**

```json
{
  "error": "Validation failed: message is required"
}
```

## Error Handling

| Error Type          | Recovery Strategy                       |
| ------------------- | --------------------------------------- |
| Missing input field | Return validation error with field name |
| Input too long      | Truncate and warn                       |
| Rate limit exceeded | Return 429 with retry-after header      |

## Security Considerations

### PII Handling

- Echo does not store or log message content
- All inputs are sanitized before reflection
- No PII is persisted

### Permissions

- Requires authenticated MCP session
- Access controlled by API key scope
