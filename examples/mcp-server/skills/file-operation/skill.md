---
skill_id: file-operation
display_name: File Operation
version: 1.0.0
category: tool
tags:
  - file
  - storage
  - io
created_at: 2024-01-15
updated_at: 2024-01-15
---

# File Operation Skill

## Capability

Perform secure file operations including read, write, and list with path validation and access control.

## MCP Tools

| Tool | Description | Input Schema |
|------|-------------|--------------|
| `read_file` | Read file contents with size limits | `{ path: string, encoding?: string }` |
| `write_file` | Write content to a file | `{ path: string, content: string, mode?: number }` |
| `list_directory` | List files in a directory | `{ path: string, recursive?: boolean }` |
| `file_exists` | Check if a file exists | `{ path: string }` |

## Usage Examples

### Example 1: Read a configuration file

**Input:**
```json
{
  "tool": "read_file",
  "arguments": {
    "path": "/app/config/settings.json"
  }
}
```

**Output:**
```json
{
  "success": true,
  "content": "{\n  \"api_key\": \"***\",\n  \"timeout\": 30\n}",
  "size": 42
}
```

### Example 2: Error - Path traversal attempt

**Input:**
```json
{
  "tool": "read_file",
  "arguments": {
    "path": "../../../etc/passwd"
  }
}
```

**Output:**
```json
{
  "success": false,
  "error": "Access denied: Path traversal detected",
  "code": "PATH_VALIDATION_FAILED"
}
```

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| `PATH_VALIDATION_FAILED` | Path traversal or invalid path | Use only allowed paths |
| `FILE_NOT_FOUND` | File does not exist | Verify path is correct |
| `PERMISSION_DENIED` | Insufficient permissions | Request appropriate access |
| `FILE_TOO_LARGE` | File exceeds size limit | Use streaming for large files |

## Security Considerations

- **PII**: File contents may contain sensitive data - handle with care
- **Permissions**: Operations restricted to allowed directories
- **Path validation**: All paths validated against traversal attacks
- **Size limits**: File reads limited to prevent memory exhaustion
- **Audit**: All file operations logged for security review
