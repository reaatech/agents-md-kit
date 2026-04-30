---
skill_id: "release-prep"
display_name: "Release Preparation"
version: "1.0.0"
description: "Orchestrate changeset-based version bumps, changelog generation, and release validation"
category: "tool"
---

# Release Preparation

## Capability

Orchestrates the complete release workflow using Changesets: version bumps, changelog generation, npm publishing, and validation of release readiness across all packages in the monorepo.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `lint_agents_md` | `z.object({ filePath: z.string().optional(), content: z.string().optional(), severity: z.enum(['error','warning','info','suggestion']).optional() })` | `{ path: string, findings: Finding[], errorCount: number, warningCount: number, infoCount: number, fixableCount: number }` | 60 RPM |
| `validate_agents_md` | `z.object({ filePath: z.string().optional(), content: z.string().optional(), strict: z.boolean().optional() })` | `{ valid: boolean, errors: Error[], warnings: Warning[] }` | 60 RPM |

The release-prep skill does not have dedicated MCP tools. Release operations are orchestrated through the Changesets CLI, GitHub Actions workflow, and the agents-md-kit CLI for validation gating.

## Usage Examples

### Example 1: Validate release readiness

- **User intent:** Check if the project is ready for release
- **CLI commands:**
  ```bash
  pnpm build          # Verify all packages build
  pnpm typecheck      # Verify cross-package type safety
  pnpm test           # Verify all tests pass
  pnpm lint           # Verify no lint issues
  pnpm changeset status   # View pending changes
  ```
- **Expected outcome:**

  All commands pass. `changeset status` shows one or more pending changesets ready for version bump.

### Example 2: Create a changeset for a new feature

- **User intent:** Record a new feature for the next release
- **CLI command:**
  ```bash
  pnpm changeset
  ```
- **Interactive flow:**
  1. Select which packages changed (e.g., `@reaatech/agents-markdown-linter`)
  2. Choose bump type: `minor` (for a new feature)
  3. Write summary: "Added heading-auto-fix rule to linter"
  4. Creates `.changeset/<random-name>.md`

### Example 3: Release workflow (CI-driven)

When changesets are merged to `main`:

1. **"Version Packages" PR** auto-opens with:
   - Bumped versions in all affected `package.json` files
   - Generated `CHANGELOG.md` entries with GitHub PR/contributor links
   - Updated internal `workspace:*` dependency versions
2. **Review and merge** the Version Packages PR
3. **Publishing** happens automatically:
   ```yaml
   # .github/workflows/release.yml
   - uses: changesets/action@v1
     with:
       publish: pnpm release          # turbo build + changeset publish
       version: pnpm version-packages # apply changesets, bump versions
   ```
4. **GitHub Packages mirror** runs automatically

## Release Checklist

Before each release, CI validates:

| Check | Command | Gate |
|-------|---------|------|
| Security audit | `pnpm audit --audit-level moderate` | CI `audit` job |
| Code format | `biome format --write . && git diff --exit-code` | CI `format` job |
| Lint | `biome check .` | CI `lint` job |
| Type check | `tsc --noEmit -p tsconfig.typecheck.json` | CI `typecheck` job |
| Build | `turbo run build` | CI `build` job |
| Tests | `turbo run test` (Node 20 + 22) | CI `test` job |
| Coverage | `turbo run test:coverage` | CI `coverage` job |
| Gate | All of the above pass | CI `all-checks` job |

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| Uncommitted changes | Working tree is dirty | Commit or stash changes first |
| Tests failing | Test suite has failures | Block release, fix tests |
| npm publish blocked | Token missing or expired | Regenerate NPM_TOKEN, re-run workflow |
| Version already exists | Version bump PR merged twice | Changesets detects this, won't re-publish |
| GitHub Packages mirror fails | Token lacks packages:write | Verify workflow permissions |

### Recovery Strategies

- **Dirty working tree:** Ensure changes are committed before creating changesets
- **Failing CI:** Check individual failure, fix, push update
- **Publish failures:** Re-trigger workflow via `workflow_dispatch` after fixing token
- **Duplicate versions:** Changesets prevents this — already-published versions are skipped

## Security Considerations

### PII Handling

- Never include author email addresses in release notes (GitHub handles attribution)
- Don't expose internal paths or infrastructure details
- Changelogs only contain public-facing summaries from changeset files

### Permissions

- npm token with publish access required (`NPM_TOKEN` secret)
- GitHub Actions `contents: write` for version bump commits
- GitHub Actions `pull-requests: write` for Version Packages PR
- GitHub Actions `id-token: write` for npm provenance (OIDC)
- GitHub Actions `packages: write` for GitHub Packages mirror

### Audit Logging

- Log all release operations with version, timestamp, and user
- Include request_id for tracing across the release workflow
- Track which packages were published and at what versions
