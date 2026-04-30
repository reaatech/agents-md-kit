---
agent_id: "example-router"
display_name: "Example LLM Router"
version: "1.0.0"
description: "A router agent that intelligently routes requests to optimal LLM providers based on cost, latency, and capability"
type: "router"
confidence_threshold: 0.75
---

# Example LLM Router

## What this is

This is an example router agent that demonstrates how to intelligently route LLM requests to optimal providers based on cost optimization, latency requirements, and model capabilities.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   LLM Request   │────▶│  Router Agent    │────▶│   LLM Provider  │
│                 │     │                  │     │   (GPT-4,       │
└─────────────────┘     └──────────────────┘     │    Claude,      │
                               │                  │    Llama)       │
                               ▼                  └─────────────────┘
                      ┌──────────────────┐
                      │   Skills         │
                      │   (cost-         │
                      │    optimization, │
                      │    latency-      │
                      │    optimization, │
                      │    judgment-     │
                      │    routing)      │
                      └──────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Router** | Main routing decision logic |
| **Cost Optimizer** | Minimizes inference costs |
| **Latency Optimizer** | Minimizes response time |
| **Judgment Router** | Escalates complex queries to stronger models |

## Skill System

Router agents use the following skills:

| Skill ID | File | Description |
|----------|------|-------------|
| `cost-optimization` | `skills/cost-optimization/skill.md` | Cost-based routing decisions |
| `latency-optimization` | `skills/latency-optimization/skill.md` | Latency-based routing |
| `judgment-routing` | `skills/judgment-routing/skill.md` | Escalation for complex queries |

## MCP Integration

This agent exposes the following MCP tools:

| Tool | Input Schema | Output | Description |
|------|-------------|--------|-------------|
| `route_request` | `z.object({ prompt: z.string(), constraints: z.object().optional() })` | `{ provider: string, model: string, estimated_cost: number }` | Route to optimal provider |
| `get_provider_status` | `z.object({})` | `{ providers: array }` | Get provider health status |
| `update_routing_policy` | `z.object({ policy: z.object() })` | `{ updated: boolean }` | Update routing configuration |

## Agent Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `COST_BUDGET_PER_REQUEST` | Maximum cost per request | `0.01` |
| `LATENCY_TARGET_MS` | Target response time | `2000` |
| `ESCALATION_THRESHOLD` | Complexity score for escalation | `0.8` |

## Security Considerations

### PII Handling

- Never log full prompt content
- Anonymize user identifiers
- Redact sensitive data from prompts

### Provider Security

- API keys encrypted at rest
- Rate limiting per provider
- Circuit breaker for failing providers

## Observability

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `router.requests.total` | Counter | Total routed requests |
| `router.requests.cost_usd` | Counter | Total inference cost |
| `router.provider.selection` | Counter | Provider selection counts |
| `router.escalations.total` | Counter | Escalations to stronger models |

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
- [LLM Routing Best Practices](https://example.com/llm-routing)
