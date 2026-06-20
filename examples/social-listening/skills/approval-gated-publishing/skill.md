---
skill_id: "approval-gated-publishing"
display_name: "Approval Gated Publishing"
version: "1.0.0"
description: "Prepares Xquik publish payloads for explicit human approval before account actions"
category: "tool"
---

# Approval Gated Publishing

## Capability

Prepares a review payload for Xquik write-like calls and blocks execution until the user approves the exact account, target, text, and media.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `prepare_publish_review` | `z.object({ account: z.string(), text: z.string(), media_urls: z.array(z.string()).optional(), reply_to: z.string().optional() })` | `{ review_id: string, requires_approval: true }` | 60 RPM |
| `record_publish_decision` | `z.object({ review_id: z.string(), approved: z.boolean(), reason: z.string().optional() })` | `{ status: string }` | 120 RPM |

### Tool: prepare_publish_review

Builds the final review record and returns a blocking approval requirement. The actual Xquik write call happens only after the user approves that exact payload.

**Input Schema:**

```typescript
z.object({
  account: z.string().min(1),
  text: z.string().min(1),
  media_urls: z.array(z.string().url()).optional(),
  reply_to: z.string().optional(),
})
```

**Output:**

```typescript
{
  review_id: string;
  requires_approval: true;
  account: string;
  text: string;
  media_urls?: string[];
  reply_to?: string;
}
```

## Usage Examples

### Prepare a Tweet for Review

**Request:**

```json
{
  "name": "prepare_publish_review",
  "arguments": {
    "account": "@example",
    "text": "We published a new agent skill example.",
    "media_urls": []
  }
}
```

**Response:**

```json
{
  "review_id": "review_123",
  "requires_approval": true,
  "account": "@example",
  "text": "We published a new agent skill example.",
  "media_urls": []
}
```

### Block Missing Approval

**Request:**

```json
{
  "name": "record_publish_decision",
  "arguments": {
    "review_id": "review_123",
    "approved": false,
    "reason": "Needs legal review."
  }
}
```

**Response:**

```json
{
  "status": "blocked"
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `APPROVAL_REQUIRED` | A write-like action was requested before human approval | Show the exact payload and wait |
| `ACCOUNT_MISSING` | No posting account was selected | Ask the user to choose an authorized account |
| `PAYLOAD_CHANGED` | Text, media, or target changed after approval | Create a new review record |
| `UNSAFE_CONTENT` | Payload contains private or unsupported content | Remove the content or ask for explicit authorization |

## Security Considerations

- Never post, reply, DM, upload media, create monitors, or change account state without explicit user approval
- Show the final text and media list before any Xquik write-like call
- Do not add links, hashtags, mentions, or claims that the user did not request
- Do not persist raw private messages, credentials, or private timelines in review records
