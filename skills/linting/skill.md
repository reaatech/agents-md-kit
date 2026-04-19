---
skill_id: "linting"
display_name: "Linting"
version: "1.0.0"
description: "Style and structure linting rules for agent documentation"
category: "tool"
---

# Linting

## Capability

Applies style, content, and best-practice linting rules to AGENTS.md and SKILL.md files to ensure quality, consistency, and adherence to community standards.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `lint_file` | `z.object({ path: z.string(), rules: z.array(z.string()).optional(), severity: z.enum(['error', 'warning', 'info']).optional() })` | `{ errors: number, warnings: number, info: number, results: LintResult[] }` | 60 RPM |
| `lint_directory` | `z.object({ path: z.string(), recursive: z.boolean().optional(), rules: z.array(z.string()).optional() })` | `{ files: { path: string, errors: number, warnings: number, results: LintResult[] }[] }` | 30 RPM |
| `auto_fix` | `z.object({ path: z.string(), rules: z.array(z.string()).optional(), dry_run: z.boolean().optional() })` | `{ fixed: number, skipped: number, changes: Change[] }` | 30 RPM |
| `list_rules` | `z.object({ category: z.enum(['style', 'content', 'best-practice']).optional() })` | `{ rules: { id: string, description: string, severity: string, auto_fix: boolean }[] }` | 60 RPM |

## Usage Examples

### Example 1: Lint a single file

- **User intent:** Check an AGENTS.md file for style and quality issues
- **Tool call:**
  ```json
  {
    "name": "lint_file",
    "arguments": {
      "path": "./agents/my-agent/AGENTS.md",
      "severity": "warning"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "errors": 0,
    "warnings": 3,
    "info": 2,
    "results": [
      {
        "rule": "heading-order",
        "severity": "warning",
        "message": "Heading level skipped from h2 to h4",
        "line": 23,
        "auto_fix": true
      },
      {
        "rule": "no-code-language",
        "severity": "warning",
        "message": "Code block missing language identifier",
        "line": 45,
        "auto_fix": true
      },
      {
        "rule": "trailing-whitespace",
        "severity": "info",
        "message": "Trailing whitespace detected",
        "line": 12,
        "auto_fix": true
      }
    ]
  }
  ```

### Example 2: Auto-fix formatting issues

- **User intent:** Automatically fix all fixable linting issues
- **Tool call:**
  ```json
  {
    "name": "auto_fix",
    "arguments": {
      "path": "./agents/my-agent/AGENTS.md",
      "dry_run": true
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "fixed": 0,
    "skipped": 3,
    "changes": [
      {
        "rule": "heading-order",
        "line": 23,
        "old": "#### Subsection",
        "new": "### Subsection",
        "description": "Changed h4 to h3 to maintain heading hierarchy"
      },
      {
        "rule": "no-code-language",
        "line": 45,
        "old": "```",
        "new": "```json",
        "description": "Added json language identifier based on content"
      },
      {
        "rule": "trailing-whitespace",
        "line": 12,
        "old": "Some text   ",
        "new": "Some text",
        "description": "Removed trailing whitespace"
      }
    ]
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| File not found | Path doesn't exist | Return error with suggestion to check path |
| Permission denied | No read access | Return error suggesting permission fix |
| Parse error | Invalid markdown | Return error with line number |
| Too many files | Directory has 1000+ files | Suggest using filters or batch processing |

### Recovery Strategies

- **Permission issues:** Suggest running with appropriate permissions
- **Parse errors:** Show the problematic section with context
- **Large directories:** Suggest using `--include` patterns to filter files

## Security Considerations

### PII Handling

- Never log file content — only report issues with line numbers
- Don't include file content in error messages or traces
- Redact file paths that might contain sensitive information

### Permissions

- Read-only access for linting (no write without explicit consent)
- Auto-fix requires explicit user confirmation
- Dry-run mode available for previewing changes

### Audit Logging

- Log all lint operations with file paths and result counts
- Include request_id for tracing
- Track lint duration and rules executed
