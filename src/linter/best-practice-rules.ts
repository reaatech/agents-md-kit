/**
 * Best practice linting rules for AGENTS.md and SKILL.md files
 */

import { registerRule } from './rules-engine.js';
import type { LintRule } from './rules-engine.js';

/**
 * Rule: missing-pii-mention
 * Security section should mention PII handling
 */
const missingPiiMentionRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Find security section
  const securitySection = document.sections?.find((s) =>
    s.title.toLowerCase().includes('security'),
  );

  if (!securitySection) {
    return findings;
  }

  const content = (securitySection.content ?? '').toLowerCase();
  const piiKeywords = ['pii', 'personal', 'sensitive', 'data protection', 'gdpr', 'privacy'];
  const hasPiiMention = piiKeywords.some((keyword) => content.includes(keyword));

  if (!hasPiiMention) {
    findings.push({
      ruleId: 'missing-pii-mention',
      severity: 'warning',
      message: 'Security section should mention PII handling',
      line: securitySection.location?.line,
      suggestion: 'Add a paragraph about how PII is handled, stored, and protected',
    });
  }

  return findings;
};

registerRule('best-practice', 'missing-pii-mention', missingPiiMentionRule, {
  id: 'missing-pii-mention',
  description: 'Security section should mention PII handling',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: missing-logging-mention
 * Observability section should mention structured logging
 */
const missingObservabilityRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Find observability section
  const observabilitySection = document.sections?.find((s) =>
    s.title.toLowerCase().includes('observability'),
  );

  if (!observabilitySection) {
    return findings;
  }

  const content = (observabilitySection.content ?? '').toLowerCase();
  const loggingKeywords = [
    'structured logging',
    'json logging',
    'log level',
    'logger',
    'pino',
    'winston',
  ];
  const hasLoggingMention = loggingKeywords.some((keyword) => content.includes(keyword));

  if (!hasLoggingMention) {
    findings.push({
      ruleId: 'missing-observability',
      severity: 'warning',
      message: 'Observability section should mention structured logging',
      line: observabilitySection.location?.line,
      suggestion: 'Add information about logging approach and log format',
    });
  }

  return findings;
};

registerRule('best-practice', 'missing-observability', missingObservabilityRule, {
  id: 'missing-observability',
  description: 'Observability section should mention structured logging',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: incomplete-examples
 * Examples should include both success and error cases
 */
const incompleteExamplesRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Find examples section
  const examplesSection = document.sections?.find((s) => s.title.toLowerCase().includes('example'));

  if (!examplesSection) {
    return findings;
  }

  const content = (examplesSection.content ?? '').toLowerCase();
  const errorKeywords = ['error', 'fail', 'exception', 'throw', 'catch', 'invalid'];
  const hasErrorCase = errorKeywords.some((keyword) => content.includes(keyword));

  if (!hasErrorCase) {
    findings.push({
      ruleId: 'incomplete-examples',
      severity: 'warning',
      message: 'Examples should include error handling cases',
      line: examplesSection.location?.line,
      suggestion: 'Add at least one example showing error handling',
    });
  }

  return findings;
};

registerRule('best-practice', 'incomplete-examples', incompleteExamplesRule, {
  id: 'incomplete-examples',
  description: 'Examples should include both success and error cases',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: missing-mcp-schema
 * MCP tools should have input schemas documented
 */
const missingMcpSchemaRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Find MCP Integration section
  const mcpSection = document.sections?.find((s) => s.title.toLowerCase().includes('mcp'));

  if (!mcpSection) {
    return findings;
  }

  const content = mcpSection.content ?? '';
  const hasSchemaBlock =
    content.includes('z.object') ||
    content.includes('Input Schema') ||
    content.includes('z.input') ||
    /schema\s*[=:]\s*\{/.test(content);

  if (!hasSchemaBlock) {
    findings.push({
      ruleId: 'missing-mcp-schema',
      severity: 'warning',
      message: 'MCP tools should have input/output schemas documented',
      line: mcpSection.location?.line,
      suggestion: 'Add Zod schema definitions for MCP tool inputs and outputs',
    });
  }

  return findings;
};

registerRule('best-practice', 'missing-mcp-schema', missingMcpSchemaRule, {
  id: 'missing-mcp-schema',
  description: 'MCP tools should have input schemas documented',
  severity: 'warning',
  autoFixable: false,
});

/**
 * Rule: missing-confidence-threshold
 * Agent config must include confidence_threshold
 */
const missingConfidenceThresholdRule: LintRule = (document) => {
  const findings: ReturnType<LintRule> = [];

  // Only applicable to AGENTS.md documents
  const isSkill = document.path.includes('skill.md') || document.path.includes('skills/');
  if (isSkill) {
    return findings;
  }

  // Check frontmatter for confidence_threshold
  const raw = document.frontmatter?.raw ?? '';
  const hasConfidenceInFrontmatter = raw.includes('confidence_threshold');

  // Also check the document body for confidence_threshold mention
  const hasConfidenceInBody = document.raw.includes('confidence_threshold');

  if (!hasConfidenceInFrontmatter && !hasConfidenceInBody) {
    findings.push({
      ruleId: 'missing-confidence',
      severity: 'error',
      message: 'Agent config must include confidence_threshold',
      suggestion: 'Add confidence_threshold to frontmatter or agent configuration section',
    });
  }

  return findings;
};

registerRule('best-practice', 'missing-confidence', missingConfidenceThresholdRule, {
  id: 'missing-confidence',
  description: 'Agent config must include confidence_threshold',
  severity: 'error',
  autoFixable: false,
});
