/**
 * Scaffold module barrel export
 */

export type { GenerateResult } from './file-generator.js';
export { generateFiles, previewGeneration } from './file-generator.js';
export type { TemplateContext } from './template-engine.js';
export { compileTemplate, getAvailableTemplates, loadTemplate } from './template-engine.js';
