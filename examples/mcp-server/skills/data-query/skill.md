---
skill_id: data-query
display_name: Data Query
version: 1.0.0
category: tool
tags:
  - database
  - query
  - data
created_at: 2024-01-15
updated_at: 2024-01-15
---

# Data Query Skill

## Capability

Execute structured data queries against databases and data sources with proper validation and rate limiting.

## MCP Tools

| Tool | Description | Input Schema |
|------|-------------|--------------|
| `query_database` | Execute a read-only SQL query | `{ query: string, database?: string }` |
| `get_schema` | Retrieve table schema information | `{ table: string, database?: string }` |
| `list_tables` | List all tables in a database | `{ database?: string }` |

## Usage Examples

### Example 1: Query users table

**Input:**
```json
{
  "tool": "query_database",
  "arguments": {
    "query": "SELECT id, name, email FROM users WHERE active = true LIMIT 10"
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob", "email": "bob@example.com"}
  ],
  "row_count": 2
}
```

### Example 2: Error - Invalid query

**Input:**
```json
{
  "tool": "query_database",
  "arguments": {
    "query": "DROP TABLE users"
  }
}
```

**Output:**
```json
{
  "success": false,
  "error": "Query rejected: Only SELECT queries are allowed",
  "code": "QUERY_VALIDATION_FAILED"
}
```

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `QUERY_VALIDATION_FAILED` | Non-SELECT query attempted | Use only read operations |
| `CONNECTION_TIMEOUT` | Database connection timeout | Retry with exponential backoff |
| `RATE_LIMIT_EXCEEDED` | Too many queries | Wait before retrying |

## Security Considerations

- **PII**: Query results may contain PII - ensure proper access controls
- **Permissions**: Only SELECT queries are allowed; INSERT/UPDATE/DELETE are blocked
- **Audit**: All queries are logged for security audit
- **Rate limiting**: Prevents abuse with configurable rate limits
