---
skill_id: "schema-validation"
display_name: "Schema Validation"
version: "1.0.0"
description: "Zod schema validation for AGENTS.md and SKILL.md files"
category: "tool"
---

# Schema Validation

## Capability

Validates AGENTS.md and SKILL.md files against Zod schemas to ensure structural correctness, required sections, and proper frontmatter.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `validate_agents_md` | `z.object({ path: z.string(), strict: z.boolean().optional() })` | `{ valid: boolean, errors: Error[], warnings: Warning[] }` | 60 RPM |
| `validate_skill_md` | `z.object({ path: z.string(), strict: z.boolean().optional() })` | `{ valid: boolean, errors: Error[], warnings: Warning[] }` | 60 RPM |
| `validate_frontmatter` | `z.object({ content: z.string(), type: z.enum(['agents', 'skill']) })` | `{ valid: boolean, fields: Record<string, unknown>, errors: Error[] }` | 60 RPM |

## Usage Examples

### Example 1: Validate AGENTS.md file

- **User intent:** Validate that an AGENTS.md file conforms to the schema
- **Tool call:**
  ```json
  {
    "name": "validate_agents_md",
    "arguments": {
      "path": "./agents/my-agent/AGENTS.md",
      "strict": true
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "rule": "missing-pii-mention",
        "message": "Security section should mention PII handling",
        "line": 45,
        "suggestion": "Add a paragraph about PII handling in the Security Considerations section"
      }
    ]
  }
  ```

### Example 2: Validate SKILL.md file with errors

- **User intent:** Validate a skill file that has missing sections
- **Tool call:**
  ```json
  {
    "name": "validate_skill_md",
    "arguments": {
      "path": "./agents/my-agent/skills/echo/skill.md"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "valid": false,
    "errors": [
      {
        "rule": "heading-missing",
        "message": "Required section 'Error Handling' not found",
        "line": null,
        "suggestion": "Add a '## Error Handling' section with known failure modes and recovery strategies"
      }
    ],
    "warnings": []
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| File not found | Path doesn't exist | Return error with suggestion to check path |
| Parse error | Invalid YAML frontmatter | Return error with line number and context |
| Invalid schema | Zod validation failure | Return detailed field-level errors |
| Circular reference | Skill references itself | Return error with dependency chain |

### Recovery Strategies

- **Missing files:** Suggest using `scaffold` command to generate missing files
- **Parse errors:** Show the problematic YAML snippet with line numbers
- **Schema violations:** List specific fields that failed validation with suggestions
- **Cross-reference errors:** List all broken references and suggest fixes

## Security Considerations

### PII Handling

- Never log full file content — only metadata (path, size, section names)
- Redact any potential PII in error messages
- Don't include file content in trace spans

### Permissions

- Read-only access to files (no write without explicit consent)
- Respect file system permissions
- Don't follow symlinks outside the project directory

### Audit Logging

- Log all validation operations with file paths and results
- Include request_id for tracing
- Track validation duration for performance monitoring
