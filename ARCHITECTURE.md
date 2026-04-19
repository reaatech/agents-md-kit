# agents-md-kit — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client Layer                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                  │
│  │     CLI     │    │   Library   │    │  MCP Client │                  │
│  │   (npx)     │    │  (import)   │    │  (Agent)    │                  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                  │
│         │                   │                   │                         │
│         └───────────────────┼───────────────────┘                         │
│                             │                                               │
└─────────────────────────────┼─────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Core Engine                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      Processing Pipeline                          │   │
│  │                                                                   │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐           │   │
│  │  │   Parser    │───▶│  Validator  │───▶│   Linter    │           │   │
│  │  │  (Markdown  │    │   (Schema)  │    │   (Rules)   │           │   │
│  │  │    AST)     │    │             │    │             │           │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Reporters                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Console   │  │    JSON     │  │     HTML    │  │  Markdown   │    │
│  │  (Colored)  │  │ (Machine)   │  │  (Dashboard)│  │  (Summary)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Cross-Cutting Concerns                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │    Scaffold      │  │   Observability  │  │    Examples      │       │
│  │   Generator      │  │  - Tracing (OTel)│  │    Gallery       │       │
│  │  (Templates)     │  │  - Metrics (OTel)│  │  (Reference)     │       │
│  │                  │  │  - Logging (pino)│  │                  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Design Principles

### 1. Schema-First Validation
- All validation is based on explicit Zod schemas
- Schemas define the contract for AGENTS.md and SKILL.md files
- Validation errors reference specific schema rules
- Schemas are versioned and extensible

### 2. Helpful Error Messages
- Every error includes line numbers and column positions
- Suggestions for fixes are provided when possible
- Context snippets show the problematic content
- Auto-fix capabilities for common issues

### 3. Non-Destructive Operations
- Validation never modifies files
- Linting reports issues without changing content
- Auto-fix requires explicit user consent
- Dry-run mode for all operations

### 4. Fast Feedback
- Validation completes in <1s for typical files
- Parallel processing for batch operations
- Incremental validation (only changed files)
- Caching of parse results

### 5. Extensible Architecture
- Custom lint rules can be added without modifying core
- Pluggable reporters for custom output formats
- Template system for scaffold customization
- Configuration-driven behavior

---

## Component Deep Dive

### Markdown Parser

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Markdown Parser                                 │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │   File      │    │  Frontmatter│    │   Markdown  │              │
│  │   Reader    │    │   Extractor │    │    Parser   │              │
│  │             │    │             │    │             │              │
│  │ - Read file │    │ - Extract   │    │ - Parse to  │              │
│  │ - Detect    │    │   YAML      │    │   AST       │              │
│  │   encoding  │    │ - Validate  │    │ - Track     │              │
│  │             │    │   structure │    │   line      │              │
│  │             │    │             │    │   numbers   │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            ▼                                         │
│                   ┌─────────────┐                                    │
│                   │   Parsed    │                                    │
│                   │  Document   │                                    │
│                   │             │                                    │
│                   │ - Front-    │                                    │
│                   │   matter    │                                    │
│                   │ - Sections  │                                    │
│                   │ - Tables    │                                    │
│                   │ - Code      │                                    │
│                   │   blocks    │                                    │
│                   │ - Line      │                                    │
│                   │   mapping   │                                    │
│                   └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Parser Features:**
- Uses remark for markdown AST generation
- Preserves line numbers for error reporting
- Extracts YAML frontmatter separately
- Builds section hierarchy from headings
- Parses tables into structured data
- Handles code blocks with language identifiers

### Schema Validator

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Schema Validator                                 │
│                                                                      │
│  Input: ParsedDocument { frontmatter, sections, content }           │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  Frontmatter    │    │   Section       │    │   Content       │  │
│  │  Validation     │    │   Validation    │    │   Validation    │  │
│  │                 │    │                 │    │                 │  │
│  │ - Required      │    │ - Required      │    │ - Minimum       │  │
│  │   fields        │    │   sections      │    │   length        │  │
│  │ - Field types   │    │ - Section       │    │ - Format        │  │
│  │ - Enum values   │    │   ordering      │    │ - Cross-        │  │
│  │ - Custom        │    │ - Cross-        │    │   references    │  │
│  │   validators    │    │   references    │    │                 │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│                                                                      │
│  Output: ValidationResult { valid, errors, warnings, suggestions }  │
└─────────────────────────────────────────────────────────────────────┘
```

**Validation Layers:**
1. **Frontmatter validation** — Zod schema for YAML frontmatter
2. **Section validation** — Required sections present and ordered
3. **Content validation** — Content quality and completeness
4. **Cross-reference validation** — Skills referenced actually exist

### Linting Rules Engine

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Linting Rules Engine                              │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │   Style     │    │   Content   │    │ Best        │              │
│  │   Rules     │    │   Rules     │    │ Practice    │              │
│  │             │    │             │    │ Rules       │              │
│  │ - Heading   │    │ - Required  │    │ - Security  │              │
│  │   hierarchy │    │   sections  │    │   mentions  │              │
│  │ - Code      │    │ - Section   │    │ - PII       │              │
│  │   language  │    │   content   │    │   handling  │              │
│  │ - Table     │    │ - Cross-    │    │ - Confidence│              │
│  │   format    │    │   references│    │   threshold │              │
│  │ - Whitespace│    │ - Duplicates│    │ - Structured│              │
│  │             │    │             │    │   logging   │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            ▼                                         │
│                   ┌─────────────┐                                    │
│                   │ Auto-Fix    │                                    │
│                   │ Engine      │                                    │
│                   │             │                                    │
│                   │ - Fix       │                                    │
│                   │   trailing  │                                    │
│                   │   whitespace│                                    │
│                   │ - Fix       │                                    │
│                   │   heading   │                                    │
│                   │   hierarchy │                                    │
│                   │ - Add       │                                    │
│                   │   language  │                                    │
│                   │   identifiers                                    │                                    │
│                   └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Rule Categories:**
- **Style rules** — Formatting and presentation
- **Content rules** — Structural and semantic correctness
- **Best practice rules** — Industry-standard patterns

**Auto-Fix Capabilities:**
- Trailing whitespace removal
- Heading hierarchy correction
- Code block language addition
- Table formatting standardization

### Scaffold Generator

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Scaffold Generator                               │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  Template   │    │  Variable   │    │    File     │              │
│  │  Loader     │    │  Resolver   │    │  Generator  │              │
│  │             │    │             │    │             │              │
│  │ - Load      │    │ - Prompt    │    │ - Create    │              │
│  │   Handlebars│    │   for inputs│    │   directory │              │
│  │   templates │    │ - Apply     │    │   structure │              │
│  │             │    │   defaults  │    │ - Write     │              │
│  │ - Parse     │    │ - Validate  │    │   files     │              │
│  │   partials  │    │   values    │    │ - Handle    │              │
│  │             │    │             │    │   conflicts │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            ▼                                         │
│                   ┌─────────────┐                                    │
│                   │  Generated  │                                    │
│                   │   Files     │                                    │
│                   │             │                                    │
│                   │ - AGENTS.md │                                    │
│                   │ - skills/   │                                    │
│                   │   *.md      │                                    │
│                   │ - Config    │                                    │
│                   │   files     │                                    │
│                   └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Template Types:**
- **MCP server** — Basic MCP server agent template
- **Orchestrator** — Multi-agent orchestrator template
- **Classifier** — Intent classifier agent template
- **Router** — LLM router agent template
- **Evaluator** — Evaluation harness agent template

### Reporter System

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Reporter System                                │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  Console    │    │    JSON     │    │    HTML     │              │
│  │  Reporter   │    │   Reporter  │    │   Reporter  │              │
│  │             │    │             │    │             │              │
│  │ - Colored   │    │ - Machine   │    │ - Interactive│             │
│  │   output    │    │   readable  │    │   dashboard │              │
│  │ - Progress  │    │ - CI/CD     │    │ - Charts    │              │
│  │   indicators│    │   friendly  │    │ - Clickable │              │
│  │ - Summary   │    │ - Structured│    │   locations │              │
│  │   statistics│    │   data      │    │ - Summary   │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                       │
│         └──────────────────┼──────────────────┘                       │
│                            ▼                                         │
│                   ┌─────────────┐                                    │
│                   │  Markdown   │                                    │
│                   │  Reporter   │                                    │
│                   │             │                                    │
│                   │ - GitHub    │                                    │
│                   │   flavored  │                                    │
│                   │ - PR comment│                                    │
│                   │   ready     │                                    │
│                   │ - Summary   │                                    │
│                   │   table     │                                    │
│                   └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Validation Flow

```
1. Load markdown file(s)
        │
2. Parse markdown to AST:
   - Extract frontmatter (YAML)
   - Build section hierarchy
   - Parse tables and code blocks
   - Preserve line numbers
        │
3. Validate frontmatter:
   - Check required fields
   - Validate field types
   - Check enum values
        │
4. Validate sections:
   - Check required sections present
   - Validate section ordering
   - Check cross-references
        │
5. Run lint rules:
   - Style rules (formatting)
   - Content rules (structure)
   - Best practice rules (quality)
        │
6. Generate report:
   - Aggregate errors and warnings
   - Add suggestions for fixes
   - Format output (console/JSON/HTML/markdown)
        │
7. Return results with exit code
```

### Scaffold Flow

```
1. User selects agent type (mcp-server, orchestrator, etc.)
        │
2. Prompt for configuration:
   - agent_id, display_name
   - Skill types to include
   - Output directory
        │
3. Load templates:
   - AGENTS.md template
   - SKILL.md templates for each skill
        │
4. Resolve variables:
   - Substitute user-provided values
   - Apply defaults
   - Validate configuration
        │
5. Generate files:
   - Create directory structure
   - Write AGENTS.md
   - Write skills/*.md files
   - Handle conflicts (don't overwrite)
        │
6. Report generated files
```

---

## Security Model

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────┐
│ Layer 1: Input                                                       │
│ - File path validation (no directory traversal)                     │
│ - File size limits (prevent memory exhaustion)                      │
│ - Encoding detection and validation                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 2: Parsing                                                     │
│ - YAML parsing with safe mode (no code execution)                   │
│ - Markdown parsing with sanitization                                │
│ - No external resource loading                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 3: Validation                                                  │
│ - Secret detection (flag potential API keys)                        │
│ - PII detection (flag potential personal data)                      │
│ - No code execution from markdown content                           │
├─────────────────────────────────────────────────────────────────────┤
│ Layer 4: Output                                                      │
│ - No file modification without consent                              │
│ - Sanitized error messages (no path leakage)                        │
│ - PII redaction in logs                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Secret Detection

The linter includes a `potential-secret` rule that detects:
- API key patterns (e.g., `sk-`, `api_key=`, `AKIA`)
- Private keys (e.g., `-----BEGIN RSA PRIVATE KEY-----`)
- Tokens (e.g., `ghp_`, `xoxb-`, `Bearer`)
- Passwords in URLs (e.g., `://user:pass@`)

### PII Detection

The validator flags potential PII in examples:
- Email addresses
- Phone numbers
- Social security numbers
- Credit card numbers
- IP addresses

---

## Observability

### Tracing

Every operation generates OpenTelemetry spans:

| Span | Attributes |
|------|------------|
| `agents_md_kit.parse` | file, size, sections |
| `agents_md_kit.validate` | type (agents/skill), valid |
| `agents_md_kit.lint` | rules_executed, warnings |
| `agents_md_kit.scaffold` | agent_type, skills_generated |

### Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `agents_md_kit.operations.total` | Counter | `operation`, `status` | Total operations |
| `agents_md_kit.operations.duration_ms` | Histogram | `operation` | Operation latency |
| `agents_md_kit.validation.errors` | Counter | `file_type` | Validation errors |
| `agents_md_kit.linting.warnings` | Counter | `rule` | Lint warnings by rule |
| `agents_md_kit.scaffold.files_generated` | Counter | `agent_type` | Files generated |

### Logging

All operations are logged with structured JSON:

```json
{
  "timestamp": "2026-04-15T23:00:00Z",
  "service": "agents-md-kit",
  "operation": "validate",
  "file": "AGENTS.md",
  "file_type": "agents",
  "valid": true,
  "errors": 0,
  "warnings": 2,
  "duration_ms": 45,
  "request_id": "req-123"
}
```

---

## Failure Modes

| Failure | Detection | Recovery |
|---------|-----------|----------|
| File not found | ENOENT error | Report clear error with path |
| Parse error | YAML/markdown parse failure | Report line number and context |
| Invalid frontmatter | Zod validation failure | List missing/invalid fields |
| Missing required section | Section validation failure | Suggest adding section |
| Circular skill reference | Cross-reference validation | Report circular dependency |
| Template not found | Template loader failure | Fall back to default template |
| File write conflict | EEXIST error | Prompt for overwrite confirmation |
| Memory limit exceeded | File size check | Skip file, report warning |

---

## Deployment Architecture

### GCP Cloud Run

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Cloud Run Service                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   agents-md-kit Container                     │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                │    │
│  │  │ CLI/      │  │ OTel      │  │ Examples  │                │    │
│  │  │ Library   │  │ Sidecar   │  │ Gallery   │                │    │
│  │  └───────────┘  └───────────┘  └───────────┘                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Config:                                                             │
│  - Min instances: 0 (scale to zero)                                 │
│  - Max instances: 5 (configurable)                                  │
│  - Memory: 512MB, CPU: 1 vCPU                                       │
│  - Timeout: 60s                                                     │
│                                                                      │
│  Observability: OTel → Cloud Monitoring / Datadog                    │
│  Storage: GCS for examples gallery                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## References

- **AGENTS.md** — Agent development guide
- **DEV_PLAN.md** — Development checklist
- **README.md** — Quick start and overview
- **examples/gallery/** — Curated example files
- **docs/SCHEMA_REFERENCE.md** — Complete schema documentation
- **docs/LINT_RULES.md** — Lint rules reference
- **MCP Specification** — https://modelcontextprotocol.io/
- **agent-mesh/AGENTS.md** — Multi-agent orchestration patterns
