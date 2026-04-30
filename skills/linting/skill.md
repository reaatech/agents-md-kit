---
skill_id: "linting"
display_name: "Linting"
version: "1.0.0"
description: "Style and structure linting rules for agent documentation"
category: "tool"
---

# Linting

## Capability

Applies style, content, and best-practice linting rules to AGENTS.md and SKILL.md files to ensure quality, consistency, and adherence to community standards. Ships with 18 built-in rules across three categories, plus an extensible rule registry and auto-fix engine.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `lint_agents_md` | `z.object({ filePath: z.string().optional(), content: z.string().optional(), severity: z.enum(['error','warning','info','suggestion']).optional() })` | `{ path: string, findings: Finding[], errorCount: number, warningCount: number, infoCount: number, fixableCount: number }` | 60 RPM |

## Usage Examples

### Example 1: Lint a single file

- **User intent:** Check an AGENTS.md file for style and quality issues
- **Tool call:**
  ```json
  {
    "name": "lint_agents_md",
    "arguments": {
      "filePath": "./agents/my-agent/AGENTS.md",
      "severity": "warning"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "errorCount": 0,
    "warningCount": 3,
    "infoCount": 2,
    "findings": [
      {
        "ruleId": "heading-order",
        "severity": "warning",
        "message": "Heading level skipped from h2 to h4",
        "line": 23
      },
      {
        "ruleId": "no-code-language",
        "severity": "warning",
        "message": "Code block missing language identifier",
        "line": 45
      },
      {
        "ruleId": "trailing-whitespace",
        "severity": "info",
        "message": "Trailing whitespace detected",
        "line": 12
      }
    ]
  }
  ```

### Example 2: Lint with auto-fix via CLI

- **User intent:** Automatically fix all fixable linting issues
- **Tool call:**
  ```json
  {
    "name": "lint_agents_md",
    "arguments": {
      "filePath": "./agents/my-agent/AGENTS.md",
      "severity": "suggestion"
    }
  }
  ```
- **Expected response:**

  All 18 rules run. Findings with `autoFixable: true` (trailing-whitespace, no-code-language, table-format, heading-missing) include fix payloads. Apply fixes via the CLI `format --fix` command or the `runAutoFix` library function.

## Lint Rules Reference

### Style Rules

| Rule ID | Severity | Auto-fix | Description |
|---------|----------|----------|-------------|
| `heading-order` | warning | No | Heading levels must not be skipped |
| `no-code-language` | warning | Yes | Code blocks should specify a language |
| `trailing-whitespace` | info | Yes | Lines must not have trailing whitespace |
| `line-too-long` | info | No | Lines must not exceed 120 characters |
| `table-format` | warning | Yes | Table rows must have consistent column counts |
| `list-format` | warning | No | List markers must be consistent |

### Content Rules

| Rule ID | Severity | Auto-fix | Description |
|---------|----------|----------|-------------|
| `heading-missing` | error | Yes | Required section headings must be present |
| `empty-section` | warning | No | Sections must contain content |
| `placeholder-text` | warning | No | No TODO/FIXME placeholders |
| `duplicate-section` | error | No | Section titles must be unique |
| `broken-skill-ref` | error | No | Referenced skill files must exist |
| `duplicate-skill-id` | error | No | Skill IDs must be unique |
| `section-ordering` | warning | No | Sections should follow recommended order |
| `min-content-length` | warning | No | Sections should have minimum content |

### Best Practice Rules

| Rule ID | Severity | Auto-fix | Description |
|---------|----------|----------|-------------|
| `missing-pii-mention` | warning | No | Security section should mention PII |
| `missing-observability` | warning | No | Observability section should mention structured logging |
| `incomplete-examples` | warning | No | Usage examples should include error cases |
| `missing-mcp-schema` | warning | No | MCP tools should document input schemas |
| `missing-confidence` | error | No | Agent config must include confidence_threshold |

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| File not found | Path doesn't exist | Return error with suggestion to check path |
| Permission denied | No read access | Return error suggesting permission fix |
| Parse error | Invalid markdown | Return error with line number |
| Too many files | Directory has 1000+ files | Suggest using filters or patterns |

### Recovery Strategies

- **Permission issues:** Suggest running with appropriate permissions
- **Parse errors:** Show the problematic section with context
- **Large directories:** Suggest using file patterns to scope the lint run

## Security Considerations

### PII Handling

- Never log file content — only report issues with line numbers
- Don't include file content in error messages or traces
- Redact file paths that might contain sensitive information

### Permissions

- Read-only access for linting (no write without explicit consent)
- Auto-fix via `format --fix` command with explicit user consent
- Dry-run mode available via `--dry-run` flag

### Audit Logging

- Log all lint operations with file paths and result counts
- Include request_id for tracing
- Track lint duration and rules executed
