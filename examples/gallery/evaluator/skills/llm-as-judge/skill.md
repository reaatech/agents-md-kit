---
skill_id: "llm-as-judge"
display_name: "LLM-as-Judge Skill"
version: "1.0.0"
description: "Uses LLM to evaluate output quality based on configurable criteria"
category: "evaluation"
---

# LLM-as-Judge Skill

## Capability

Leverages LLMs to evaluate agent output quality based on configurable criteria such as relevance, coherence, helpfulness, and factual accuracy.

## MCP Tools

| Tool | Input Schema | Output | Rate Limit |
|------|-------------|--------|------------|
| `judge_output` | `z.object({ prompt: z.string(), output: z.string(), criteria: z.array(z.string()) })` | `{ score: number, feedback: string, breakdown: object }` | 30 RPM |
| `batch_judge` | `z.object({ items: z.array(z.object({ prompt: z.string(), output: z.string() })), criteria: z.array(z.string()) })` | `{ results: array, avg_score: number }` | 10 RPM |
| `get_judge_config` | `z.object({})` | `{ config: object }` | 60 RPM |

### Tool: judge_output

Evaluates output quality using LLM judgment.

**Input Schema:**

```typescript
z.object({
  prompt: z.string().describe('Original user prompt'),
  output: z.string().describe('Agent output to evaluate'),
  criteria: z.array(z.string()).describe('Evaluation criteria (relevance, coherence, helpfulness, accuracy)'),
})
```

**Output:**

```typescript
{
  score: number;
  feedback: string;
  breakdown: {
    relevance: number;
    coherence: number;
    helpfulness: number;
    accuracy: number;
  };
  judge_model: string;
}
```

## Usage Examples

### Judge Output Quality

**Request:**
```json
{
  "name": "judge_output",
  "arguments": {
    "prompt": "How do I reset my password?",
    "output": "To reset your password, go to Settings > Account > Security > Change Password. Enter your current password and then your new password twice.",
    "criteria": ["relevance", "helpfulness", "accuracy"]
  }
}
```

**Response:**
```json
{
  "score": 0.9,
  "feedback": "The response is highly relevant and provides clear, actionable steps. The information appears accurate for standard password reset flows.",
  "breakdown": {
    "relevance": 0.95,
    "helpfulness": 0.9,
    "accuracy": 0.85
  },
  "judge_model": "gpt-4"
}
```

## Error Handling

| Error Type | Cause | Recovery |
|------------|-------|----------|
| `JUDGE_API_ERROR` | LLM API failure | Retry with backoff, return error |
| `INVALID_CRITERIA` | Unknown criteria specified | Use default criteria set |
| `RATE_LIMIT_EXCEEDED` | API rate limit hit | Queue and retry later |

## Evaluation Criteria

| Criterion | Description |
|-----------|-------------|
| `relevance` | How well the output addresses the prompt |
| `coherence` | Logical flow and readability |
| `helpfulness` | Practical utility of the response |
| `accuracy` | Factual correctness |
| `completeness` | Coverage of all aspects |
| `safety` | Absence of harmful content |

## Security Considerations

- Judge API keys are encrypted
- Evaluation data is anonymized
- Rate limiting prevents abuse

## Testing

```bash
npm test -- tests/skills/llm-as-judge.test.ts
