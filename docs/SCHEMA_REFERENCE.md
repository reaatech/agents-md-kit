# Schema Reference

Complete documentation of the AGENTS.md and SKILL.md schemas validated by agents-md-kit.

## AGENTS.md Schema

### Frontmatter (Required)

```yaml
---
agent_id: "unique-agent-identifier"
display_name: "Human-Readable Agent Name"
version: "1.0.0"
description: "Brief description of the agent"
type: "mcp"  # mcp, orchestrator, classifier, router, evaluator
---
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `agent_id` | ✅ | string | Unique identifier (lowercase, hyphens allowed) |
| `display_name` | ✅ | string | Human-readable name |
| `version` | ✅ | string | Semantic version (X.Y.Z) |
| `description` | ❌ | string | Brief description |
| `type` | ❌ | string | Agent type classification |

### Required Sections

| Section | Heading | Description |
|---------|---------|-------------|
| Title | `# {Agent Name}` | Must match display_name |
| What this is | `## What this is` | One-paragraph description |
| Architecture Overview | `## Architecture Overview` | ASCII diagram + component table |
| Skill System | `## Skill System` | Skills table with references |
| MCP Integration | `## MCP Integration` | MCP tools and protocol details |
| Security Considerations | `## Security Considerations` | PII handling, auth, input validation |
| Observability | `## Observability` | Logging, tracing, metrics |
| Production Readiness | `## Checklist: Production Readiness` | Pre-deployment checklist |

### Skill System Table Format

```markdown
| Skill ID | File | Description |
|----------|------|-------------|
| `skill-id` | `skills/skill-id/skill.md` | Skill description |
```

### MCP Integration Table Format

```markdown
| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `tool_name` | `z.object({...})` | `{ field: type }` | Description |
```

---

## SKILL.md Schema

### Frontmatter (Required)

```yaml
---
skill_id: "unique-skill-identifier"
display_name: "Human-Readable Skill Name"
version: "1.0.0"
description: "Brief description of the skill"
category: "tool"  # tool, orchestration, evaluation
---
```

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `skill_id` | ✅ | string | Unique identifier (lowercase, hyphens allowed) |
| `display_name` | ✅ | string | Human-readable name |
| `version` | ✅ | string | Semantic version (X.Y.Z) |
| `description` | ❌ | string | Brief description |
| `category` | ❌ | string | Skill category |

### Required Sections

| Section | Heading | Description |
|---------|---------|-------------|
| Title | `# {Skill Name}` | Must match display_name |
| Capability | `## Capability` | One-sentence description |
| MCP Tools | `## MCP Tools` | Table of tools with schemas |
| Usage Examples | `## Usage Examples` | At least 2 examples (success + error) |
| Error Handling | `## Error Handling` | Known failures and recovery |
| Security Considerations | `## Security Considerations` | PII, permissions, audit |

### MCP Tools Table Format

```markdown
| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `tool_name` | `z.object({...})` | `{ field: type }` | 100 RPM |
```

---

## Validation Rules

### Frontmatter Validation

- `agent_id` / `skill_id` must be non-empty, lowercase, hyphens allowed
- `version` must match semantic versioning pattern (X.Y.Z)
- All required fields must be present

### Section Validation

- Required sections must exist at the correct heading level
- Sections must contain non-empty content
- Skill references must point to existing files

### Cross-Reference Validation

- Skills referenced in AGENTS.md must exist in the skills/ directory
- Skill IDs must be unique within an agent

---

## Examples

### Minimal Valid AGENTS.md

```markdown
---
agent_id: "my-agent"
display_name: "My Agent"
version: "1.0.0"
---

# My Agent

## What this is

A brief description of what this agent does.

## Architecture Overview

```
[Component diagram]
```

### Key Components

| Component | Description |
|-----------|-------------|
| Main | Main component |

## Skill System

| Skill ID | File | Description |
|----------|------|-------------|
| `example` | `skills/example/skill.md` | Example skill |

## MCP Integration

| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `example` | `z.object({})` | `{}` | Example tool |

## Security Considerations

### PII Handling

No PII is collected or stored.

## Observability

### Structured Logging

All operations are logged with structured JSON.

## Checklist: Production Readiness

- [x] All required sections documented
```

### Minimal Valid SKILL.md

```markdown
---
skill_id: "example-skill"
display_name: "Example Skill"
version: "1.0.0"
---

# Example Skill

## Capability

Brief description of what this skill does.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `example` | `z.object({})` | `{}` | 100 RPM |

## Usage Examples

### Success Case

**Request:**
```json
{"name": "example", "arguments": {}}
```

**Response:**
```json
{}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `UNKNOWN` | Unknown error | Retry |

## Security Considerations

No sensitive data is processed.
