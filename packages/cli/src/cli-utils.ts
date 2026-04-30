/**
 * CLI utility functions that wrap core modules with file-based operations
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import type {
  AgentsMdDocument,
  LintResult,
  ScaffoldConfig,
  Severity,
  SkillMdDocument,
  ValidationResult,
} from '@reaatech/agents-markdown';
import { getAutoFixableRules, runAutoFix } from '@reaatech/agents-markdown-linter';
import { runLintRules } from '@reaatech/agents-markdown-linter';
import { parseMarkdown } from '@reaatech/agents-markdown-parser';
import {
  type GenerateResult,
  generateFiles,
  previewGeneration,
} from '@reaatech/agents-markdown-scaffold';
import { validate } from '@reaatech/agents-markdown-validator';

const SEVERITY_ORDER: Record<Severity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  suggestion: 3,
};

export async function parseFile(filePath: string): Promise<AgentsMdDocument | SkillMdDocument> {
  const content = await readFile(filePath, 'utf-8');
  return parseMarkdown(content, filePath);
}

export async function lintFile(filePath: string): Promise<LintResult> {
  const document = await parseFile(filePath);
  return runLintRules(document);
}

export async function lintDirectory(dirPath: string): Promise<LintResult[]> {
  const files = await findMarkdownFiles(dirPath);
  return Promise.all(files.map((file) => lintFile(file)));
}

export async function validateFile(filePath: string, strict = false): Promise<ValidationResult> {
  const document = await parseFile(filePath);
  return validate(document, {
    strict,
    basePath: path.dirname(filePath),
  });
}

export async function validateDirectory(
  dirPath: string,
  strict = false
): Promise<ValidationResult[]> {
  const files = await findMarkdownFiles(dirPath);
  return Promise.all(files.map((file) => validateFile(file, strict)));
}

export function scaffoldAgent(
  config: ScaffoldConfig,
  dryRun = false
): GenerateResult | Array<{ path: string; exists: boolean }> {
  if (dryRun) {
    return previewGeneration(config);
  }

  return generateFiles(config);
}

export async function applyFixesToFile(
  filePath: string,
  ruleIds: string[]
): Promise<{ original: string; fixed: string }> {
  const original = await readFile(filePath, 'utf-8');
  return {
    original,
    fixed: runAutoFix(original, ruleIds),
  };
}

export function applyFixes(content: string, ruleIds: string[]): string {
  return runAutoFix(content, ruleIds);
}

export function getFixableRules(): string[] {
  return getAutoFixableRules();
}

export function filterLintResult(result: LintResult, minimumSeverity: Severity): LintResult {
  const findings = result.findings.filter(
    (finding) => SEVERITY_ORDER[finding.severity] <= SEVERITY_ORDER[minimumSeverity]
  );

  return {
    path: result.path,
    findings,
    errorCount: findings.filter((finding) => finding.severity === 'error').length,
    warningCount: findings.filter((finding) => finding.severity === 'warning').length,
    infoCount: findings.filter((finding) => finding.severity === 'info').length,
    fixableCount: findings.filter((finding) => finding.autoFixable).length,
  };
}

export async function findMarkdownFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.markdown'))) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

export async function pathIsDirectory(targetPath: string): Promise<boolean> {
  return (await stat(targetPath)).isDirectory();
}
