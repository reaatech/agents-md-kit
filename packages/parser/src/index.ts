/**
 * Parser module exports
 */

// Code block extractor
export {
  extractCodeBlocks,
  formatCodeBlock,
  getCodeBlocksByLanguage,
  getUniqueLanguages,
  hasLanguage,
  mightContainSecret,
  validateCodeBlockLanguages,
} from './code-block-extractor.js';

// Frontmatter parser
export {
  createFrontmatter,
  extractFrontmatter,
  type FrontmatterResult,
  updateFrontmatter,
  validateFrontmatterStructure,
} from './frontmatter-parser.js';
// Main parser
export {
  findSection,
  getHeadings,
  getSectionTitles,
  parseMarkdown,
  parseMarkdownFiles,
} from './markdown-parser.js';
// Section extractor
// Re-export findSection as findSectionByTitle from section-extractor to avoid collision
export {
  extractSections,
  findSection as findSectionByTitle,
  findSectionByPath,
  flattenSectionTitles,
  getSectionsAtLevel,
  hasSection,
} from './section-extractor.js';
// Table parser
export {
  extractColumn,
  formatTable,
  parseTables,
  tableToObjects,
  validateTableStructure,
} from './table-parser.js';
