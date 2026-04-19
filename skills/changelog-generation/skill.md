---
skill_id: "changelog-generation"
display_name: "Changelog Generation"
version: "1.0.0"
description: "Generate changelogs from git commit history with semver support"
category: "tool"
---

# Changelog Generation

## Capability

Automatically generates changelogs from git commit history, supporting semantic versioning, conventional commits, and multiple output formats.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `generate_changelog` | `z.object({ repo_path: z.string(), from_tag: z.string().optional(), to_tag: z.string().optional(), format: z.enum(['markdown', 'json', 'text']).optional() })` | `{ version: string, date: string, entries: ChangelogEntry[], raw: string }` | 30 RPM |
| `parse_semver_tag` | `z.object({ tag: z.string() })` | `{ major: number, minor: number, patch: number, prerelease: string, metadata: string }` | 60 RPM |
| `format_changelog` | `z.object({ entries: z.array(z.object({ type: z.string(), scope: z.string().optional(), description: z.string(), author: z.string().optional(), pr: z.string().optional() })), format: z.enum(['markdown', 'json', 'text']) })` | `{ formatted: string, word_count: number }` | 60 RPM |
| `suggest_next_version` | `z.object({ current_version: z.string(), commits: z.array(z.object({ message: z.string(), type: z.string() })) })` | `{ suggested_version: string, bump_type: 'major' | 'minor' | 'patch', rationale: string }` | 30 RPM |

## Usage Examples

### Example 1: Generate changelog between two tags

- **User intent:** Generate a changelog for a release between v1.0.0 and v1.1.0
- **Tool call:**
  ```json
  {
    "name": "generate_changelog",
    "arguments": {
      "repo_path": "/Users/rick/dev/2026-04/agents-md-kit",
      "from_tag": "v1.0.0",
      "to_tag": "v1.1.0",
      "format": "markdown"
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "version": "1.1.0",
    "date": "2026-04-15",
    "entries": [
      {
        "type": "feat",
        "scope": "linting",
        "description": "Add auto-fix for heading-order rule",
        "author": "jane@example.com",
        "pr": "#42"
      },
      {
        "type": "fix",
        "scope": "validator",
        "description": "Handle circular skill references correctly",
        "author": "john@example.com",
        "pr": "#45"
      }
    ],
    "raw": "## [1.1.0] - 2026-04-15\n\n### Features\n\n- **(linting)** Add auto-fix for heading-order rule (#42)\n\n### Bug Fixes\n\n- **(validator)** Handle circular skill references correctly (#45)"
  }
  ```

### Example 2: Suggest next version from commits

- **User intent:** Determine what version to bump to based on recent commits
- **Tool call:**
  ```json
  {
    "name": "suggest_next_version",
    "arguments": {
      "current_version": "1.0.0",
      "commits": [
        { "message": "feat: add new validation rule", "type": "feat" },
        { "message": "fix: correct heading detection", "type": "fix" },
        { "message": "docs: update examples", "type": "docs" }
      ]
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "suggested_version": "1.1.0",
    "bump_type": "minor",
    "rationale": "Found 1 feature commit (feat), 1 fix commit (fix), and 1 docs commit (docs). Highest priority is 'feat' which triggers a minor version bump."
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Git repo not found | Invalid repo_path | Return error suggesting to check path |
| Tag not found | from_tag or to_tag doesn't exist | List available tags as suggestions |
| No commits in range | Tags exist but no commits between them | Return empty changelog with warning |
| Invalid semver tag | Tag doesn't follow vX.Y.Z format | Attempt fuzzy parsing or return error |
| Malformed commit messages | Commits don't follow conventional format | Parse as "other" type with full message |

### Recovery Strategies

- **Missing tags:** Use `git log --oneline` to suggest nearby tags
- **Invalid semver:** Try common patterns like `release-X.Y.Z`, `vX.Y.Z`, `X.Y.Z`
- **Non-conventional commits:** Categorize as "other" and include full message

## Security Considerations

### PII Handling

- Never include author email addresses in logs or traces — use author name only
- Redact any sensitive information that might appear in commit messages
- Don't expose internal repository paths in error messages

### Permissions

- Read-only access to git repository
- No write access required (changelog is generated, not committed)
- Access to remote repository only needed for fetching tags

### Audit Logging

- Log changelog generation operations with repo path and tag range
- Include request_id for tracing
- Track number of commits processed and entries generated
