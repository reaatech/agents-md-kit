/**
 * Linting rules engine for AGENTS.md and SKILL.md files
 */

import type { AgentsMdDocument, SkillMdDocument, LintResult, RuleDefinition, Severity, Finding } from '../types/domain.js';

export type LintRule = (document: AgentsMdDocument | SkillMdDocument) => Array<{
  ruleId: string;
  severity: Severity;
  message: string;
  line?: number;
  suggestion?: string;
}>;

/**
 * Registry of all lint rules
 */
const styleRules: Map<string, { rule: LintRule; definition: RuleDefinition }> = new Map();
const contentRules: Map<string, { rule: LintRule; definition: RuleDefinition }> = new Map();
const bestPracticeRules: Map<string, { rule: LintRule; definition: RuleDefinition }> = new Map();

/**
 * Register a lint rule
 */
export function registerRule(
  category: 'style' | 'content' | 'best-practice',
  ruleId: string,
  rule: LintRule,
  definition: Omit<RuleDefinition, 'category'>
): void {
  const registry = category === 'style' ? styleRules : category === 'content' ? contentRules : bestPracticeRules;
  registry.set(ruleId, { rule, definition: { ...definition, category } });
}

/**
 * Run all registered lint rules on a document
 */
export function runLintRules(document: AgentsMdDocument | SkillMdDocument): LintResult {
  const findings: Finding[] = [];

  const allRules = [...styleRules.values(), ...contentRules.values(), ...bestPracticeRules.values()];

    for (const { rule, definition } of allRules) {
      try {
        const ruleFindings = rule(document);
        for (const finding of ruleFindings) {
          const entry: Finding = {
            rule: finding.ruleId,
            severity: finding.severity,
            message: finding.message,
            autoFixable: definition.autoFixable,
          };
          if (finding.suggestion !== undefined) {
            entry.suggestion = finding.suggestion;
          }
          if (finding.line !== undefined) {
            entry.location = { line: finding.line };
          }
          findings.push(entry);
        }
      } catch {
        findings.push({
          rule: definition.id,
          severity: 'error',
          message: `Rule '${definition.id}' failed to execute`,
          autoFixable: false,
        });
      }
    }

  const errorCount = findings.filter((f) => f.severity === 'error').length;
  const warningCount = findings.filter((f) => f.severity === 'warning').length;
  const infoCount = findings.filter((f) => f.severity === 'info').length;
  const fixableCount = findings.filter((f) => f.autoFixable).length;

  return {
    path: document.path,
    findings,
    errorCount,
    warningCount,
    infoCount,
    fixableCount,
  };
}

/**
 * Get all registered rules
 */
export function getRegisteredRules(): RuleDefinition[] {
  const allRules = [...styleRules.values(), ...contentRules.values(), ...bestPracticeRules.values()];
  return allRules.map(({ definition }) => definition);
}
