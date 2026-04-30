---
skill_id: "changelog-generation"
display_name: "Changelog Generation"
version: "1.0.0"
description: "Generate changelogs via changesets from conventional commits"
category: "tool"
---

# Changelog Generation

## Capability

Automatically generates CHANGELOG.md files and version bumps using [Changesets](https://github.com/changesets/changesets) with GitHub integration. Supports semantic versioning, conventional commits, and automated release PRs.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `get_examples` | `z.object({ type: z.string().optional(), show: z.string().optional() })` | `{ content: string }` or `Array<string>` | 60 RPM |

The changelog-generation skill leverages the Changesets workflow rather than raw git parsing. See the release-prep skill for version bump orchestration.

## Usage Examples

### Example 1: Create a changeset

- **User intent:** Record a new change for the next release
- **CLI command:**
  ```bash
  pnpm changeset
  ```
- **Expected flow:**

  Interactive prompt to select packages, bump type (major/minor/patch), and write a summary. Creates a `.changeset/*.md` file tracking the change.

### Example 2: View pending changesets

- **User intent:** See what pending changes will be included in the next release
- **CLI command:**
  ```bash
  pnpm changeset status
  ```
- **Expected output:**

  Lists all pending `.changeset/*.md` files and their summaries.

### Example 3: Generate changelogs (CI)

When a PR with changesets merges to `main`, the release workflow automatically:

1. Opens a "Version Packages" PR with:
   - Bumped version numbers in all affected `package.json` files
   - Generated `CHANGELOG.md` entries with GitHub PR/contributor links
2. When that PR is merged, packages are published to npm

```yaml
# .github/workflows/release.yml
- name: Create release PR or publish to npm
  uses: changesets/action@v1
  with:
    publish: pnpm release
    version: pnpm version-packages
```

## Workflow

```
Developer creates changeset  →  PR merges to main
                                      ↓
                              "Version Packages" PR auto-opens
                                      ↓
                              Review version bumps + CHANGELOGs
                                      ↓
                              Merge PR → publish to npm
```

## Error Handling

### Known Failure Modes

| Failure | Cause | Recovery |
|---------|-------|----------|
| No changesets found | Nothing to release | No-op, workflow succeeds |
| Version conflict | Multiple PRs changing same packages | Resolve in Version Packages PR |
| Changelog merge conflict | Parallel release PRs | Resolve manually, re-generate |
| npm publish failure | Token/network issue | Re-run workflow after fixing |

### Recovery Strategies

- **No changesets:** Nothing to do — this is normal between releases
- **Version conflicts:** Changesets deduplicates; merge the Version Packages PR
- **Publish failures:** Re-trigger the workflow via `workflow_dispatch`

## Security Considerations

### PII Handling

- Never include author email addresses in changelogs (GitHub handles attribution)
- Don't expose internal repository paths
- Changelogs only contain public-facing summaries

### Permissions

- Write access required for creating changeset files and version bumps
- npm token with publish access required for release
- GitHub Actions `contents: write` and `pull-requests: write` required

### Audit Logging

- Log all changeset creation and version bump operations
- Include request_id for tracing across the release workflow
- Track which packages were bumped and by what type
