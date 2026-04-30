/**
 * Scaffold module barrel export
 */

export { compileTemplate, loadTemplate, getAvailableTemplates } from './template-engine.js';
export type { TemplateContext } from './template-engine.js';

export { generateFiles, previewGeneration } from './file-generator.js';
export type { GenerateResult } from './file-generator.js';
