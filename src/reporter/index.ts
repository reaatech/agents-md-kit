/**
 * Reporter module barrel export
 */

export { reportLintResult, reportValidationResult, reportScaffoldResult } from './console-reporter.js';
export { lintToJson, validationToJson, reportLintResult as reportJsonLintResult, reportValidationResult as reportJsonValidationResult } from './json-reporter.js';
export type { LintJsonOutput, ValidationJsonOutput } from './json-reporter.js';
export { reportLintAsMarkdown, reportValidationAsMarkdown, reportLintResult as reportMarkdownLintResult, reportValidationResult as reportMarkdownValidationResult } from './markdown-reporter.js';
export { generateHtmlReport, writeHtmlReport, reportLintResult as reportHtmlLintResult } from './html-reporter.js';
