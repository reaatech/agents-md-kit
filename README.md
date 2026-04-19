# agents-md-kit

Linter, validator, and scaffolding tool for AGENTS.md and SKILL.md files — the "durable agent instruction artifacts" that define how AI agents behave, what skills they possess, and how they integrate into multi-agent systems.

## Quick Start

```bash
# Install
npm install -g agents-md-kit

# Lint a file
agents-md-kit lint ./AGENTS.md

# Validate against schema
agents-md-kit validate ./AGENTS.md

# Scaffold a new agent
agents-md-kit scaffold --agent-id my-agent --display-name "My Agent" --output-dir ./my-agent/
```

## What This Is

agents-md-kit helps engineers create, validate, and maintain agent instruction files that follow best practices and community standards. It provides:

- **Schema Validation** — Zod-based validation for AGENTS.md and SKILL.md structure
- **Linting** — Style, content, and best-practice rules with auto-fix capabilities
- **Scaffolding** — Template-based generation of new agent and skill files
- **MCP Integration** — Expose validation tools via MCP protocol

## Installation

```bash
# Global install
npm install -g agents-md-kit

# Or use with npx
npx agents-md-kit lint ./AGENTS.md
```

## CLI Commands

### Lint

```bash
# Lint a single file
agents-md-kit lint ./AGENTS.md

# Lint a directory
agents-md-kit lint ./agents/

# Output as JSON
agents-md-kit lint ./AGENTS.md --format json

# Fail only on errors
agents-md-kit lint ./AGENTS.md --fail-on error
```

### Validate

```bash
# Validate AGENTS.md
agents-md-kit validate ./AGENTS.md

# Validate SKILL.md
agents-md-kit validate ./skills/echo/skill.md

# Strict mode (fail on warnings)
agents-md-kit validate ./AGENTS.md --strict
```

### Scaffold

```bash
# Create a new MCP agent
agents-md-kit scaffold \
  --agent-id my-mcp-agent \
  --display-name "My MCP Agent" \
  --agent-type mcp \
  --output-dir ./my-mcp-agent/

# Create an orchestrator with skills
agents-md-kit scaffold \
  --agent-id my-orchestrator \
  --display-name "My Orchestrator" \
  --agent-type orchestrator \
  --skills routing,circuit-breaker \
  --output-dir ./my-orchestrator/
```

## Schema Reference

### AGENTS.md Required Sections

| Section | Description |
|---------|-------------|
| `# {Agent Name}` | Title with agent name |
| `## What this is` | One-paragraph description |
| `## Architecture Overview` | ASCII diagram + component table |
| `## Skill System` | Skills table with references |
| `## MCP Integration` | MCP tools and protocol details |
| `## Security Considerations` | PII handling, auth, input validation |
| `## Observability` | Logging, tracing, metrics |
| `## Checklist: Production Readiness` | Pre-deployment checklist |

### SKILL.md Required Sections

| Section | Description |
|---------|-------------|
| `# {Skill Name}` | Title with skill name |
| `## Capability` | One-sentence description |
| `## MCP Tools` | Table of tools with schemas |
| `## Usage Examples` | At least 2 examples (success + error) |
| `## Error Handling` | Known failures and recovery |
| `## Security Considerations` | PII, permissions, audit |

## Linting Rules

| Rule ID | Severity | Description | Auto-fix |
|---------|----------|-------------|----------|
| `heading-missing` | error | Required section heading not found | No |
| `heading-order` | warning | Heading levels skipped | Yes |
| `empty-section` | warning | Section has no content | No |
| `no-code-language` | warning | Code block missing language | Yes |
| `trailing-whitespace` | info | Trailing whitespace | Yes |
| `missing-pii-mention` | warning | No PII handling in security | No |
| `broken-skill-reference` | error | References non-existent skill | No |

## MCP Integration

agents-md-kit exposes MCP tools for agent integration:

```json
{
  "name": "validate_agents_md",
  "arguments": {
    "filePath": "./AGENTS.md",
    "strict": true
  }
}
```

Available tools:
- `lint_agents_md` — Lint AGENTS.md or SKILL.md files
- `validate_agents_md` — Validate against schema
- `validate_skill_md` — Backward-compatible alias for schema validation
- `scaffold_agent` — Generate new agent files
- `get_examples` — List available examples

## CI/CD Integration

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
        run: npx agents-md-kit lint ./agents/ --format json --output lint-results.json
```

## Library Usage

```typescript
import { lintFile, validateFile, generateFiles } from 'agents-md-kit';

// Lint a file
const lintResult = await lintFile('./AGENTS.md');
console.log(lintResult.errorCount, lintResult.warningCount);

// Validate against schema
const validationResult = await validateFile('./AGENTS.md', true);
if (!validationResult.valid) {
  console.error(validationResult.errors);
}

// Scaffold new agent
generateFiles({
  agentId: 'my-agent',
  displayName: 'My Agent',
  agentType: 'mcp',
  outputDir: './my-agent/',
  skills: [{ skillId: 'echo', displayName: 'Echo', skillType: 'tool' }],
});
```

## Examples

See [examples/gallery/](./examples/gallery/) for complete examples:

- **MCP Server** — Basic MCP server agent
- **Orchestrator** — Multi-agent orchestrator
- **Classifier** — Intent classifier agent
- **Router** — LLM router agent
- **Evaluator** — Evaluation harness agent

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

MIT
