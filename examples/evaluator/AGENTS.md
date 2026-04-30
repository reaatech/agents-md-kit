---
agent_id: "example-evaluator"
display_name: "Example Evaluation Harness"
version: "1.0.0"
description: "An evaluator agent that measures agent performance using metrics, LLM-as-judge, and regression gates"
type: "evaluator"
confidence_threshold: 0.9
---

# Example Evaluation Harness

## What this is

This is an example evaluator agent that demonstrates how to measure and validate agent performance using confusion matrices, LLM-as-judge patterns, and automated regression gates for CI/CD.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Agent Output  │────▶│  Evaluator       │────▶│   Metrics      │
│   + Expected    │     │  Agent           │     │   + Judgment   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   Skills         │
                      │   (confusion-    │
                      │    matrix,       │
                      │    llm-as-judge, │
                      │    regression-   │
                      │    gates)        │
                      └──────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Evaluator** | Main evaluation orchestration logic |
| **Metrics Calculator** | Computes confusion matrix and statistical metrics |
| **LLM Judge** | Uses LLM to evaluate output quality |
| **Regression Gater** | Blocks deployments that fail quality gates |

## Skill System

Evaluator agents use the following skills:

| Skill ID | File | Description |
|----------|------|-------------|
| `confusion-matrix` | `skills/confusion-matrix/skill.md` | Metrics calculation |
| `llm-as-judge` | `skills/llm-as-judge/skill.md` | LLM-based evaluation |
| `regression-gates` | `skills/regression-gates/skill.md` | CI/CD quality gates |

## MCP Integration

This agent exposes the following MCP tools:

| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `evaluate` | `z.object({ predictions: z.array(z.object()), ground_truth: z.array(z.object()) })` | `{ metrics: object, report: string }` | Evaluate predictions |
| `judge_output` | `z.object({ prompt: z.string(), output: z.string(), criteria: z.array(z.string()) })` | `{ score: number, feedback: string }` | LLM-as-judge evaluation |
| `check_regression` | `z.object({ current_metrics: z.object(), baseline_metrics: z.object() })` | `{ passed: boolean, regressions: array }` | Check for regressions |

## Agent Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `JUDGE_MODEL` | Model to use for LLM-as-judge | `gpt-4` |
| `MIN_ACCURACY` | Minimum accuracy threshold | `0.85` |
| `MAX_REGRESSION_PCT` | Maximum allowed regression | `5%` |

## Security Considerations

### PII Handling

- Evaluation data is anonymized
- No user data is stored in evaluation results
- LLM judge prompts are sanitized

### Model Security

- Judge model API keys are encrypted
- Rate limiting on judge API calls
- Evaluation results are access-controlled

## Observability

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `evaluator.evaluations.total` | Counter | Total evaluations run |
| `evaluator.judge.requests` | Counter | LLM judge API calls |
| `evaluator.regressions.detected` | Counter | Regression detections |
| `evaluator.quality.score` | Gauge | Overall quality score |

## Checklist: Production Readiness

- [x] All required sections present and documented
- [x] Skills directory contains all referenced skill files
- [x] Security section documents PII handling
- [x] Observability section documents logging approach
- [x] Error handling covers all failure modes
- [x] Tests pass with >80% coverage
- [x] No secrets or sensitive data in code or config
- [x] Environment variables documented
- [x] Rate limiting implemented
- [x] Health check endpoint available

## References

- [AGENTS.md Specification](https://github.com/reaatech/agents-md-kit)
- [Evaluation Best Practices](https://example.com/evaluation)
