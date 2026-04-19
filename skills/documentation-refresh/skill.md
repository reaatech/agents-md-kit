---
skill_id: "documentation-refresh"
display_name: "Documentation Refresh"
version: "1.0.0"
description: "Sync documentation with code changes and validate cross-references"
category: "tool"
---

# Documentation Refresh

## Capability

Synchronizes documentation with code changes by validating cross-references, checking links, and ensuring version consistency across AGENTS.md and SKILL.md files.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `sync_versions` | `z.object({ project_path: z.string(), dry_run: z.boolean().optional() })` | `{ files_updated: string[], changes: VersionChange[], errors: string[] }` | 30 RPM |
| `validate_refs` | `z.object({ project_path: z.string(), check_internal: z.boolean().optional(), check_external: z.boolean().optional() })` | `{ broken_refs: BrokenRef[], valid_refs: number, warnings: string[] }` | 30 RPM |
| `check_links` | `z.object({ project_path: z.string(), timeout_ms: z.number().optional(), check_external: z.boolean().optional() })` | `{ broken_links: BrokenLink[], valid_links: number, warnings: string[] }` | 15 RPM |
| `detect_stale_docs` | `z.object({ project_path: z.string(), lookback_days: z.number().optional() })` | `{ stale_files: StaleDoc[], recommendations: string[] }` | 30 RPM |

## Usage Examples

### Example 1: Sync versions across project files

- **User intent:** Ensure package.json version matches AGENTS.md frontmatter version
- **Tool call:**
  ```json
  {
    "name": "sync_versions",
    "arguments": {
      "project_path": "/Users/rick/dev/2026-04/agents-md-kit",
      "dry_run": true
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "files_updated": ["AGENTS.md"],
    "changes": [
      {
        "file": "AGENTS.md",
        "field": "version",
        "old_value": "0.9.0",
        "new_value": "1.0.0",
        "source": "package.json"
      }
    ],
    "errors": []
  }
  ```

### Example 2: Validate all cross-references

- **User intent:** Check that all skill references in AGENTS.md point to existing files
- **Tool call:**
  ```json
  {
    "name": "validate_refs",
    "arguments": {
      "project_path": "/Users/rick/dev/2026-04/agents-md-kit",
      "check_internal": true,
      "check_external": false
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "broken_refs": [
      {
        "file": "AGENTS.md",
        "line": 470,
        "ref": "docs/MISSING.md",
        "type": "file",
        "context": "See [docs/MISSING.md] for details"
      }
    ],
    "valid_refs": 12,
    "warnings": [
      "skills/examples/skill.md references non-existent template file"
    ]
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| No package.json found | Not a Node.js project | Skip version sync for this project type |
| Git not available | Not a git repository | Skip stale detection, proceed with static checks |
| Network timeout | External link check takes too long | Skip external links, report timeout warning |
| Permission denied | Can't read certain files | Report permission error, continue with accessible files |
| Large project | 1000+ files to check | Use sampling or parallel processing with progress updates |

### Recovery Strategies

- **Missing package.json:** Check for alternative version sources (Cargo.toml, pyproject.toml, pom.xml)
- **Network issues:** Cache previous link check results, only re-check changed files
- **Large projects:** Suggest using `--include` patterns to limit scope

## Security Considerations

### PII Handling

- Never log file content — only report file paths and line numbers
- Don't include commit author information in reports
- Redact any sensitive paths that might contain credentials

### Permissions

- Read-only access for validation operations
- Write access only required when `dry_run: false` for version sync
- External link checks should respect robots.txt

### Audit Logging

- Log all validation operations with file paths and result counts
- Include request_id for tracing
- Track validation duration and files processed
