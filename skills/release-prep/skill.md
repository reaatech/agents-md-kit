---
skill_id: "release-prep"
display_name: "Release Preparation"
version: "1.0.0"
description: "Orchestrate version bumps, changelog generation, and release validation"
category: "tool"
---

# Release Preparation

## Capability

Orchestrates the complete release workflow including version bumps, changelog generation, git tagging, and validation of release readiness across all project artifacts.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `bump_version` | `z.object({ project_path: z.string(), bump_type: z.enum(['major', 'minor', 'patch', 'prerelease']), dry_run: z.boolean().optional(), commit: z.boolean().optional() })` | `{ old_version: string, new_version: string, files_updated: string[], commit_sha: string }` | 30 RPM |
| `create_tag` | `z.object({ repo_path: z.string(), version: z.string(), message: z.string().optional(), sign: z.boolean().optional() })` | `{ tag: string, sha: string, url: string }` | 30 RPM |
| `validate_release` | `z.object({ project_path: z.string(), checks: z.array(z.enum(['tests', 'lint', 'build', 'docs', 'security'])).optional() })` | `{ passed: boolean, checks: CheckResult[], blockers: string[] }` | 30 RPM |
| `generate_release_notes` | `z.object({ repo_path: z.string(), version: string, previous_tag: z.string().optional() })` | `{ title: string, body: string, highlights: string[], breaking_changes: string[] }` | 30 RPM |

## Usage Examples

### Example 1: Validate release readiness

- **User intent:** Check if the project is ready for release
- **Tool call:**
  ```json
  {
    "name": "validate_release",
    "arguments": {
      "project_path": "/Users/rick/dev/2026-04/agents-md-kit",
      "checks": ["tests", "lint", "build", "docs"]
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "passed": true,
    "checks": [
      {
        "name": "tests",
        "status": "passed",
        "details": "142 tests passed, 0 failed"
      },
      {
        "name": "lint",
        "status": "passed",
        "details": "No lint errors or warnings"
      },
      {
        "name": "build",
        "status": "passed",
        "details": "Build completed successfully"
      },
      {
        "name": "docs",
        "status": "passed",
        "details": "All AGENTS.md and SKILL.md files valid"
      }
    ],
    "blockers": []
  }
  ```

### Example 2: Bump version and create tag

- **User intent:** Bump minor version and create a git tag for release
- **Tool call:**
  ```json
  {
    "name": "bump_version",
    "arguments": {
      "project_path": "/Users/rick/dev/2026-04/agents-md-kit",
      "bump_type": "minor",
      "dry_run": false,
      "commit": true
    }
  }
  ```
- **Expected response:**
  ```json
  {
    "old_version": "1.0.0",
    "new_version": "1.1.0",
    "files_updated": ["package.json", "AGENTS.md"],
    "commit_sha": "abc123def456"
  }
  ```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Uncommitted changes | Working tree is dirty | Suggest committing or stashing changes first |
| Tests failing | Test suite has failures | Block release, provide test failure details |
| Version already tagged | Tag already exists for version | Suggest bumping version or deleting existing tag |
| Missing release checklist items | Required checks not passing | List specific blockers and remediation steps |
| Git push rejected | Remote branch protection rules | Suggest creating a PR instead |

### Recovery Strategies

- **Uncommitted changes:** Run `git status` and show what needs to be committed
- **Failing tests:** Show test output and suggest running tests locally first
- **Tag conflicts:** List existing tags and suggest next available version

## Security Considerations

### PII Handling

- Never include author email addresses in release notes
- Don't expose internal paths or infrastructure details
- Redact any sensitive information from commit messages in changelogs

### Permissions

- Write access required for version bump and tag creation
- Push access required for remote tag creation
- GPG key access required for signed tags (optional)

### Audit Logging

- Log all release operations with version, timestamp, and user
- Include request_id for tracing across the release workflow
- Track release validation results and any overrides applied
