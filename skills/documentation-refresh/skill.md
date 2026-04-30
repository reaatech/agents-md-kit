---
skill_id: "documentation-refresh"
display_name: "Documentation Refresh"
version: "1.0.0"
description: "Sync documentation with code changes and validate cross-references"
category: "tool"
---

# Documentation Refresh

## Capability

Synchronizes documentation with code changes by validating cross-references, checking links, and ensuring version consistency across AGENTS.md, SKILL.md, README.md, and package.json files throughout the monorepo.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `lint_agents_md` | `z.object({ filePath: z.string().optional(), content: z.string().optional(), severity: z.enum(['error','warning','info','suggestion']).optional() })` | `{ path: string, findings: Finding[], errorCount: number, warningCount: number, infoCount: number, fixableCount: number }` | 60 RPM |

The linting tool validates cross-references (broken skill refs, duplicate skill IDs) and structural issues.

## Usage Examples

### Example 1: Validate all cross-references in a monorepo

- **User intent:** Check that all skill references in AGENTS.md point to existing files
- **Tool call:**
  ```json
  {
    "name": "lint_agents_md",
    "arguments": {
      "filePath": "./AGENTS.md",
      "severity": "info"
    }
  }
  ```
- **Expected response:**

  Returns findings including `broken-skill-ref` for any skill references that don't resolve to existing files, and `duplicate-skill-id` for duplicate skill IDs.

### Example 2: Validate all example files

- **User intent:** Ensure example AGENTS.md and SKILL.md files pass validation
- **CLI command:**
  ```bash
  agents-md-kit lint ./examples/ --fail-on info
  agents-md-kit validate ./examples/ --strict
  ```
- **Expected outcome:**

  All example files pass linting and validation. Any failures indicate documentation that's drifted from code changes and needs updating.

### Example 3: Sync versions across files

- **User intent:** Ensure AGENTS.md version matches package.json versions
- **CLI approach:**

  The CLI validates that frontmatter is well-formed. For version consistency across the monorepo, use Changesets:
  ```bash
  pnpm changeset status   # View pending changes
  pnpm version-packages   # Apply version bumps (auto-updates all package.json + CHANGELOGs)
  ```

## Documentation Coverage

### Files Monitored

| File | Package | Purpose |
|------|---------|---------|
| `AGENTS.md` | Root | Agent instruction file |
| `ARCHITECTURE.md` | Root | System design deep dive |
| `README.md` | Root + 9 packages | Package-level documentation |
| `skills/*/skill.md` | Root | Skill definitions |
| `examples/*/AGENTS.md` | 5 examples | Reference agents |
| `examples/*/skills/*/skill.md` | 15 skill files | Reference skills |

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Broken references | Skills renamed or moved | Update skill references in AGENTS.md |
| Stale examples | Schema changed, examples not updated | Re-validate and fix examples |
| Missing sections | Template changed, docs not updated | Run lint to detect missing sections |
| Version mismatch | Manual version update missed a file | Use changesets for consistent versioning |

### Recovery Strategies

- **Broken references:** `lint_agents_md` identifies exact broken references with file paths
- **Stale examples:** Re-run `agents-md-kit lint ./examples/` to surface drift
- **Missing sections:** Auto-fix for `heading-missing` can insert missing section stubs
- **Version drift:** Always use `pnpm changeset` for version bumps — never edit versions manually

## Security Considerations

### PII Handling

- Never log file content — only report file paths and line numbers
- Don't include commit author information in reports
- Redact any sensitive paths that might contain credentials

### Permissions

- Read-only access for validation operations
- Write access only required when applying fixes

### Audit Logging

- Log all validation operations with file paths and result counts
- Include request_id for tracing
- Track validation duration and files processed
