---
skill_id: "session-management"
display_name: "Session Management Skill"
version: "1.0.0"
description: "Manages conversation state and session lifecycle for multi-turn interactions"
category: "state"
---

# Session Management Skill

## Capability

Manages conversation state across multi-turn interactions, providing session creation, retrieval, update, and cleanup with configurable TTL and encryption at rest.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `create_session` | `z.object({ user_id: z.string(), metadata: z.object().optional() })` | `{ session_id: string, created_at: string }` | 50 RPM |
| `get_session` | `z.object({ session_id: z.string() })` | `{ session: object, expires_at: string }` | 100 RPM |
| `update_session` | `z.object({ session_id: z.string(), data: z.object() })` | `{ updated: boolean, version: number }` | 100 RPM |
| `delete_session` | `z.object({ session_id: z.string() })` | `{ deleted: boolean }` | 50 RPM |

### Tool: create_session

Creates a new conversation session with a unique identifier.

**Input Schema:**

```typescript
z.object({
  user_id: z.string().describe('User identifier (will be anonymized)'),
  metadata: z.object({
    source: z.string().optional(),
    channel: z.string().optional(),
  }).optional(),
})
```

**Output:**

```typescript
{
  session_id: string;
  created_at: string;
  expires_at: string;
  version: number;
}
```

## Usage Examples

### Create Session

**Request:**
```json
{
  "name": "create_session",
  "arguments": {
    "user_id": "user-123",
    "metadata": {
      "source": "web",
      "channel": "chat"
    }
  }
}
```

**Response:**
```json
{
  "session_id": "sess_a1b2c3d4e5f6",
  "created_at": "2026-04-15T23:00:00Z",
  "expires_at": "2026-04-15T24:00:00Z",
  "version": 1
}
```

### Update Session (Add Conversation Turn)

**Request:**
```json
{
  "name": "update_session",
  "arguments": {
    "session_id": "sess_a1b2c3d4e5f6",
    "data": {
      "turns": [
        {
          "role": "user",
          "content": "What is the sentiment of this feedback?",
          "timestamp": "2026-04-15T23:01:00Z"
        },
        {
          "role": "assistant",
          "content": "The sentiment appears to be negative.",
          "timestamp": "2026-04-15T23:01:05Z"
        }
      ]
    }
  }
}
```

**Response:**
```json
{
  "updated": true,
  "version": 2
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `SESSION_NOT_FOUND` | Session ID doesn't exist or expired | Create new session |
| `SESSION_EXPIRED` | Session TTL exceeded | Notify user and create new session |
| `CONCURRENT_MODIFICATION` | Version mismatch on update | Retry with latest version |
| `STORAGE_ERROR` | Backend storage failure | Return error, session may be inconsistent |

## Session Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ttl_seconds` | Session time-to-live | `3600` |
| `max_turns` | Maximum conversation turns stored | `100` |
| `encryption_enabled` | Encrypt session data at rest | `true` |

## Security Considerations

### PII Handling

- User IDs are hashed before storage
- Session data is encrypted at rest
- Sessions are automatically purged after TTL
- No PII is logged in session operations

### Permissions

- Users can only access their own sessions
- Session deletion requires authentication
- Admin access for session inspection

### Audit Logging

All session operations are logged with:
- Operation type (create, get, update, delete)
- Session ID (anonymized)
- Timestamp
- Success/failure status

## Testing

### Unit Tests

```bash
npm test -- tests/skills/session-management.test.ts
```

### Integration Tests

```bash
npm run test:integration
