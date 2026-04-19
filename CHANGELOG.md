# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-16

### Added

- **Core Engine**
  - Markdown parser with frontmatter extraction and line number preservation
  - Zod schema validation for AGENTS.md and SKILL.md files
  - Linting rules engine with style, content, and best-practice rules
  - Auto-fix capabilities for common formatting issues
  - Template-based scaffold generator for new agents and skills
  - HTML reporter with interactive dashboard
  - Example gallery agents (orchestrator, classifier, router, evaluator)
  - Integration tests for end-to-end flows
  - Performance tests for large file handling
  - OpenTelemetry metrics export

- **CLI Commands**
  - `lint` — Lint AGENTS.md and SKILL.md files
  - `validate` — Validate against schema (strict mode)
  - `scaffold` — Generate new agent/skill files
  - `format` — Auto-fix formatting issues
  - `examples` — List and show examples

- **Reporter System**
  - Console reporter with colored output
  - JSON reporter for CI/CD integration
  - Markdown reporter for PR comments
  - HTML reporter with interactive dashboard

- **MCP Integration**
  - MCP server with tools: `lint_agents_md`, `validate_agents_md`, `scaffold_agent`, `get_examples`
  - StreamableHTTP transport support

- **Observability**
  - Structured JSON logging with PII redaction
  - Log levels: debug, info, warn, error
  - Operation tracing support
  - OpenTelemetry metrics export

- **Infrastructure**
  - Multi-stage Docker build (<100MB target)
  - GitHub Actions CI/CD pipeline
  - Self-linting workflow for AGENTS.md files

- **Documentation**
  - Complete README with quick start guide
  - Contributing guide with examples
  - Example gallery with MCP server agent

### Changed

- Initial release — no changes yet

### Security

- PII redaction in all logs
- No secrets stored in markdown files
- Non-root Docker container
- Input validation on all user-provided data

## [Unreleased]


