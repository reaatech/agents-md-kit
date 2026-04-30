/**
 * JSON reporter for machine-readable output
 */

import type { LintResult, ValidationResult } from '@reaatech/agents-markdown';

const SCHEMA_VERSION = '1.0.0';

export interface LintJsonOutput {
  schemaVersion: string;
  path: string;
  valid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  fixableCount: number;
  findings: LintResult['findings'];
  timestamp: string;
}

export interface ValidationJsonOutput {
  schemaVersion: string;
  path: string;
  type: 'agents' | 'skill';
  valid: boolean;
  errorCount: number;
  warningCount: number;
  suggestionCount: number;
  errors: ValidationResult['errors'];
  warnings: ValidationResult['warnings'];
  suggestions: ValidationResult['suggestions'];
  timestamp: string;
}

export function lintToJson(result: LintResult): LintJsonOutput {
  return {
    schemaVersion: SCHEMA_VERSION,
    path: result.path,
    valid: result.errorCount === 0,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    infoCount: result.infoCount,
    fixableCount: result.fixableCount,
    findings: result.findings,
    timestamp: new Date().toISOString(),
  };
}

export function validationToJson(result: ValidationResult): ValidationJsonOutput {
  return {
    schemaVersion: SCHEMA_VERSION,
    path: result.path,
    type: result.type,
    valid: result.valid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    suggestionCount: result.suggestions.length,
    errors: result.errors,
    warnings: result.warnings,
    suggestions: result.suggestions,
    timestamp: new Date().toISOString(),
  };
}

export function reportLintResult(results: LintResult | LintResult[]): string {
  const payload = Array.isArray(results) ? results.map(lintToJson) : lintToJson(results);
  return JSON.stringify(payload, null, 2);
}

export function reportValidationResult(results: ValidationResult | ValidationResult[]): string {
  const payload = Array.isArray(results)
    ? results.map(validationToJson)
    : validationToJson(results);
  return JSON.stringify(payload, null, 2);
}
