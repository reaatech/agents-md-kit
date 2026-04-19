/**
 * Parser module exports
 */

// Main parser
export {
  parseMarkdown,
  parseMarkdownFiles,
  getSectionTitles,
  findSection,
  getHeadings,
} from './markdown-parser.js';

// Frontmatter parser
export {
  extractFrontmatter,
  validateFrontmatterStructure,
  createFrontmatter,
  updateFrontmatter,
  type FrontmatterResult,
} from './frontmatter-parser.js';

// Section extractor
export {
  extractSections,
  findSectionByPath,
  flattenSectionTitles,
  hasSection,
  getSectionsAtLevel,
} from './section-extractor.js';

// Re-export findSection as findSectionByTitle from section-extractor to avoid collision
export {
  findSection as findSectionByTitle,
} from './section-extractor.js';

// Table parser
export {
  parseTables,
  extractColumn,
  tableToObjects,
  validateTableStructure,
  formatTable,
} from './table-parser.js';

// Code block extractor
export {
  extractCodeBlocks,
  hasLanguage,
  getCodeBlocksByLanguage,
  mightContainSecret,
  formatCodeBlock,
  validateCodeBlockLanguages,
  getUniqueLanguages,
} from './code-block-extractor.js';
