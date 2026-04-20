/**
 * Code block extractor for extracting fenced code blocks from markdown
 */

import type { CodeBlock } from '../types/domain.js';

/**
 * Extract all fenced code blocks from markdown content
 */
export function extractCodeBlocks(content: string): CodeBlock[] {
  const lines = content.split('\n');
  const codeBlocks: CodeBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    const fenceMatch = line.match(/^(`{3,}|~{3,})(.*)$/);

    if (fenceMatch) {
      const fenceChar = fenceMatch[1]?.[0] ?? '`';
      const fenceLength = fenceMatch[1]?.length ?? 3;
      const infoString = (fenceMatch[2] ?? '').trim();
      const startLine = i;

      // Extract language from info string
      const language = extractLanguage(infoString);

      // Find closing fence
      i++;
      const codeLines: string[] = [];

      while (i < lines.length) {
        const codeLine = lines[i] ?? '';
        const closingFence = new RegExp(`^${fenceChar.repeat(fenceLength)}\\s*$`);

        if (closingFence.test(codeLine)) {
          break;
        }

        codeLines.push(codeLine);
        i++;
      }

      // Create code block object
      const codeBlock: CodeBlock = {
        ...(language !== null ? { language } : {}),
        content: codeLines.join('\n'),
        location: {
          line: startLine + 1, // 1-indexed
          endLine: i + 1, // 1-indexed
        },
      };

      codeBlocks.push(codeBlock);
    }

    i++;
  }

  return codeBlocks;
}

/**
 * Extract language identifier from info string
 * Handles formats like: js, javascript, typescript, ts, json, yaml, etc.
 */
function extractLanguage(infoString: string): string | null {
  if (!infoString) {
    return null;
  }

  // Take the first word (before any spaces or special chars)
  const match = infoString.match(/^([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}

/**
 * Check if a code block has a language specified
 */
export function hasLanguage(codeBlock: CodeBlock): boolean {
  return codeBlock.language !== undefined && codeBlock.language !== '';
}

/**
 * Get all code blocks of a specific language
 */
export function getCodeBlocksByLanguage(codeBlocks: CodeBlock[], language: string): CodeBlock[] {
  const lowerLang = language.toLowerCase();
  return codeBlocks.filter((block) => block.language?.toLowerCase() === lowerLang);
}

/**
 * Check if code block content looks like it might contain a secret
 */
export function mightContainSecret(codeBlock: CodeBlock): boolean {
  const content = codeBlock.content.toLowerCase();

  // Common secret patterns
  const secretPatterns = [
    /api[_-]?key\s*[=:]/i,
    /password\s*[=:]/i,
    /secret\s*[=:]/i,
    /token\s*[=:]/i,
    /-----begin\s+(rsa\s+)?private\s+key-----/i,
    /sk-[a-zA-Z0-9]{20,}/i,
    /ghp_[a-zA-Z0-9]{20,}/i,
    /xoxb-[a-zA-Z0-9-]{10,}/i,
    /AKIA[0-9A-Z]{16}/i,
  ];

  return secretPatterns.some((pattern) => pattern.test(content));
}

/**
 * Format a code block back to markdown string
 */
export function formatCodeBlock(codeBlock: CodeBlock): string {
  const fence = '```';
  const language = codeBlock.language ?? '';
  const content = codeBlock.content;

  return `${fence}${language}\n${content}\n${fence}`;
}

/**
 * Validate that code blocks have language identifiers
 */
export function validateCodeBlockLanguages(
  codeBlocks: CodeBlock[],
): Array<{ codeBlock: CodeBlock; hasLanguage: boolean }> {
  return codeBlocks.map((block) => ({
    codeBlock: block,
    hasLanguage: hasLanguage(block),
  }));
}

/**
 * Get unique languages used in code blocks
 */
export function getUniqueLanguages(codeBlocks: CodeBlock[]): string[] {
  const languages = new Set<string>();
  for (const block of codeBlocks) {
    if (block.language !== undefined && block.language !== '') {
      languages.add(block.language.toLowerCase());
    }
  }
  return Array.from(languages).sort();
}
