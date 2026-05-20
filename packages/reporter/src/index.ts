/**
 * Reporter module barrel export
 */

export {
  reportLintResult,
  reportScaffoldResult,
  reportValidationResult,
} from './console-reporter.js';
export {
  generateHtmlReport,
  reportLintResult as reportHtmlLintResult,
  writeHtmlReport,
} from './html-reporter.js';
export type { LintJsonOutput, ValidationJsonOutput } from './json-reporter.js';
export {
  lintToJson,
  reportLintResult as reportJsonLintResult,
  reportValidationResult as reportJsonValidationResult,
  validationToJson,
} from './json-reporter.js';
export {
  reportLintAsMarkdown,
  reportLintResult as reportMarkdownLintResult,
  reportValidationAsMarkdown,
  reportValidationResult as reportMarkdownValidationResult,
} from './markdown-reporter.js';
