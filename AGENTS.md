---
agent_id: "agents-md-kit"
display_name: "Agents.md Kit"
version: "1.0.0"
description: "Linter, validator, and scaffolding tool for AGENTS.md and SKILL.md files"
type: "mcp"
confidence_threshold: 0.9
---

# agents-md-kit — Agent Development Guide

## What this is

This document defines how to use `agents-md-kit` to create, validate, and maintain
AGENTS.md and SKILL.md files — the "durable agent instruction artifacts" that define
how AI agents behave, what skills they possess, and how they integrate into multi-agent
systems.

**Target audience:** Engineers building AI agents who need to create standardized
agent instruction files that follow community best practices and can be validated
for correctness, completeness, and quality.

---

## Architecture Overview

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  AGENTS.md /    │────▶│   agents-md-kit   │────▶│    Reports    │
│   SKILL.md      │     │  (Parser/Validate)│     │ (Errors/      │
│   Files         │     │                 │     │  Warnings)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │    Examples      │
                       │    Gallery       │
                       └──────────────────┘
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Parser** | `src/parser/` | Markdown AST extraction with line number preservation |
| **Validator** | `src/validator/` | Zod schema validation for AGENTS.md and SKILL.md |
| **Linter** | `src/linter/` | Style, content, and best-practice linting rules |
| **Scaffold** | `src/scaffold/` | Template-based file generation |
| **Reporter** | `src/reporter/` | Console, JSON, HTML, and Markdown output formats |
| **MCP Server** | `src/mcp-server/` | Expose validation tools via MCP protocol |

---

## Skill System

Skills represent the atomic capabilities of agents-md-kit. Each skill corresponds
to a validation or generation capability.

### Available Skills

| Skill ID | File | Description |
|----------|------|-------------|
| `schema-validation` | `skills/schema-validation/skill.md` | Zod schema validation for AGENTS.md/SKILL.md |
| `linting` | `skills/linting/skill.md` | Style and structure linting rules |
| `scaffolding` | `skills/scaffolding/skill.md` | Template-based file generation |
| `examples` | `skills/examples/skill.md` | Curated example gallery |
| `changelog-generation` | `skills/changelog-generation/skill.md` | Generate changelogs from git commit history |
| `documentation-refresh` | `skills/documentation-refresh/skill.md` | Sync docs with code changes |
| `release-prep` | `skills/release-prep/skill.md` | Orchestrate release workflow |

---

## AGENTS.md Schema

Every AGENTS.md file must follow this schema. The validator checks for required
sections, proper structure, and content quality.

### Required Frontmatter

```yaml
---
agent_id: "my-agent"
display_name: "My Agent"
version: "1.0.0"
description: "Brief description of agent capabilities"
type: "mcp"  # mcp, orchestrator, classifier, router, evaluator
---
```

### Required Sections

| Section | Heading Level | Description |
|---------|---------------|-------------|
| Title | `#` | Agent name as the main heading |
| What this is | `##` | One-paragraph description of the agent |
| Architecture Overview | `##` | ASCII diagram and component table |
| Skill System | `##` | Table of skills with references to skills/*.md files |
| MCP Integration | `##` | MCP tools, protocol details, request/response formats |
| Security Considerations | `##` | PII handling, authentication, input validation |
| Observability | `##` | Logging, tracing, metrics |
| Checklist: Production Readiness | `##` | Pre-deployment checklist |

### Recommended Sections

| Section | Heading Level | Description |
|---------|---------------|-------------|
| Agent Configuration | `##` | Environment variables and configuration |
| Error Handling | `##` | Known failure modes and recovery strategies |
| Testing | `##` | Testing approach and test structure |
| Deployment | `##` | Deployment instructions and infrastructure |
| References | `##` | Links to related documentation |

### Validation Rules

| Rule | Severity | Description |
|------|----------|-------------|
| Required sections present | error | All required sections must exist |
| Section ordering | warning | Sections should follow recommended order |
| Skill references valid | error | Referenced skills/*.md files must exist |
| MCP tools documented | warning | MCP tools should have input/output schemas |
| Security mentions PII | warning | Security section should mention PII handling |
| Observability mentions logging | warning | Observability section should mention structured logging |

---

## SKILL.md Schema

Every SKILL.md file must follow this schema. Skills are the atomic unit of agent
capability and must be well-documented.

### Required Frontmatter

```yaml
---
skill_id: "my-skill"
display_name: "My Skill"
version: "1.0.0"
description: "Brief description of skill capabilities"
category: "tool"  # tool, orchestration, evaluation, routing
---
```

### Required Sections

| Section | Heading Level | Description |
|---------|---------------|-------------|
| Title | `#` | Skill name as the main heading |
| Capability | `##` | One-sentence description of what this skill enables |
| MCP Tools | `##` | Table of tools with input schemas and outputs |
| Usage Examples | `##` | At least 2 examples (success and error cases) |
| Error Handling | `##` | Known failures and recovery strategies |
| Security Considerations | `##` | PII, permissions, audit logging |

### MCP Tools Table Format

```markdown
### MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `tool_name` | `z.object({ param: z.string() })` | `{ result: string }` | 60 RPM |
```

### Validation Rules

| Rule | Severity | Description |
|------|----------|-------------|
| Required sections present | error | All required sections must exist |
| MCP tools table valid | error | Tools table must have Tool, Input Schema, Output columns |
| Examples include error case | warning | At least one example should show error handling |
| Security mentions permissions | warning | Security section should mention permission requirements |

---

## Using agents-md-kit

### CLI Commands

```bash
# Install
npm install -g agents-md-kit

# Lint AGENTS.md and SKILL.md files
agents-md-kit lint ./agents/my-agent/AGENTS.md
agents-md-kit lint ./agents/my-agent/skills/

# Validate against schema (strict mode)
agents-md-kit validate ./agents/my-agent/AGENTS.md
agents-md-kit validate ./agents/my-agent/skills/echo/skill.md

# Scaffold new agent files
agents-md-kit scaffold --type mcp-server --output ./my-new-agent/

# Auto-fix formatting issues
agents-md-kit format ./agents/my-agent/ --fix

# List and view examples
agents-md-kit examples
agents-md-kit examples show mcp-server
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed (only info-level findings) |
| `1` | Validation errors found |
| `2` | Lint warnings found (with `--fail-on warning`) |
| `3` | Execution error (file not found, parse error) |

### CI/CD Integration

```yaml
# .github/workflows/agents-md-lint.yml
name: Agents.md Lint

on:
  pull_request:
    paths:
      - '**/AGENTS.md'
      - '**/skills/**/*.md'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint agent files
        run: |
          npx agents-md-kit lint ./agents/ \
            --format json \
            --output lint-results.json

      - name: Validate schemas
        run: |
          npx agents-md-kit validate ./agents/ \
            --fail-on error

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: lint-results
          path: lint-results.json
```

---

## MCP Integration

The kit exposes MCP tools for agent integration:

### lint_agents_md Tool

```json
{
  "name": "lint_agents_md",
  "arguments": {
    "path": "./agents/my-agent/AGENTS.md",
    "severity": "warning",
    "format": "json"
  }
}
```

### validate_skill_md Tool

```json
{
  "name": "validate_skill_md",
  "arguments": {
    "path": "./agents/my-agent/skills/echo/skill.md",
    "strict": true
  }
}
```

### scaffold_agent Tool

```json
{
  "name": "scaffold_agent",
  "arguments": {
    "type": "orchestrator",
    "agent_id": "my-orchestrator",
    "display_name": "My Orchestrator",
    "output_dir": "./agents/my-orchestrator/",
    "skills": ["routing", "circuit-breaker", "session-management"]
  }
}
```

### get_examples Tool

```json
{
  "name": "get_examples",
  "arguments": {
    "type": "mcp-server",
    "format": "markdown"
  }
}
```

---

## Linting Rules

### Style Rules

| Rule ID | Severity | Description | Auto-fix |
|---------|----------|-------------|----------|
| `heading-order` | warning | Heading levels skipped | Yes |
| `no-code-language` | warning | Code block missing language | Yes |
| `trailing-whitespace` | info | Trailing whitespace | Yes |
| `line-too-long` | info | Line exceeds 120 chars | No |
| `table-format` | warning | Table formatting inconsistent | Yes |

### Content Rules

| Rule ID | Severity | Description | Auto-fix |
|---------|----------|-------------|----------|
| `heading-missing` | error | Required section missing | No |
| `empty-section` | warning | Section has no content | No |
| `placeholder-text` | warning | TODO/FIXME placeholders | No |
| `broken-skill-ref` | error | References non-existent skill | No |
| `duplicate-skill-id` | error | Multiple skills with same ID | No |

### Best Practice Rules

| Rule ID | Severity | Description | Auto-fix |
|---------|----------|-------------|----------|
| `missing-pii-mention` | warning | No PII handling in security | No |
| `missing-confidence` | error | No confidence_threshold in config | No |
| `missing-observability` | warning | No structured logging mentioned | No |
| `incomplete-examples` | warning | Examples missing error cases | No |

---

## Security Considerations

### No Secrets in Markdown

- **Never** include API keys, tokens, or secrets in AGENTS.md or SKILL.md files
- Use environment variable references like `${API_KEY}` instead of actual values
- The linter will flag potential secrets with the `potential-secret` rule

### PII Handling

- **Never** include real user data in examples
- Use placeholder values like `user-123`, `emp456`, `john.doe@example.com`
- The validator checks that security sections mention PII handling

### Input Sanitization

- Examples should demonstrate input validation
- Security sections should document sanitization approaches
- The linter checks for security best practices

---

## Observability

### Structured Logging

Every lint/validate operation is logged with:

```json
{
  "timestamp": "2026-04-15T23:00:00Z",
  "service": "agents-md-kit",
  "operation": "lint",
  "file": "AGENTS.md",
  "errors": 0,
  "warnings": 2,
  "duration_ms": 45
}
```

### OpenTelemetry Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `agents_md_kit.operations.total` | Counter | Total operations by type |
| `agents_md_kit.operations.duration_ms` | Histogram | Operation latency |
| `agents_md_kit.validation.errors` | Counter | Validation errors found |
| `agents_md_kit.linting.warnings` | Counter | Lint warnings found |

---

## Integration with Multi-Agent Systems

### Using with agent-mesh

Register agents-md-kit as an agent in agent-mesh:

```yaml
# agents/agents-md-kit.yaml
agent_id: agents-md-kit
display_name: Agents.md Kit
description: >-
  Linter, validator, and scaffolding tool for AGENTS.md and SKILL.md files.
  Helps ensure agent instruction files follow best practices and community standards.
endpoint: "${AGENTS_MD_KIT_ENDPOINT:-http://localhost:8084}"
type: mcp
is_default: false
confidence_threshold: 0.9
examples:
  - "Validate my AGENTS.md file"
  - "Lint all skill files in my agent directory"
  - "Generate a new agent scaffold"
skills:
  - schema-validation
  - linting
  - scaffolding
```

## Using with mcp-contract-kit

agents-md-kit complements mcp-contract-kit:

- **agents-md-kit** — validates the documentation (AGENTS.md, SKILL.md)
- **mcp-contract-kit** — validates the implementation (MCP server conformance)

Use both in CI/CD for comprehensive agent validation:

```yaml
# .github/workflows/agent-validation.yml
jobs:
  documentation:
    runs-on: ubuntu-latest
    steps:
      - name: Lint documentation
        run: npx agents-md-kit lint ./agents/

  implementation:
    runs-on: ubuntu-latest
    steps:
      - name: Validate MCP conformance
        run: npx mcp-contract-kit test http://localhost:8080
```

---

## Checklist: Production Readiness

Before deploying agent instruction files to production:

- [ ] AGENTS.md passes schema validation (no errors)
- [ ] All SKILL.md files pass schema validation
- [ ] Lint warnings addressed or documented as intentional
- [ ] All referenced skill files exist
- [ ] No secrets or sensitive data in markdown files
- [ ] Security section documents PII handling
- [ ] Observability section documents logging approach
- [ ] Examples include both success and error cases
- [ ] Agent configuration uses environment variables (no hardcoded values)
- [ ] Production readiness checklist is complete and accurate

---

## References

- **ARCHITECTURE.md** — System design deep dive
- **DEV_PLAN.md** — Development checklist
- **README.md** — Quick start and overview
- **examples/gallery/** — Curated example files
- **docs/SCHEMA_REFERENCE.md** — Complete schema documentation
- **docs/LINT_RULES.md** — Lint rules reference
- **MCP Specification** — https://modelcontextprotocol.io/
- **agent-mesh/AGENTS.md** — Multi-agent orchestration patterns
