/**
 * Auto-fix capabilities for linting rules
 */

/**
 * Fix trailing whitespace in content
 */
function fixTrailingWhitespace(content: string): string {
  return content
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

/**
 * Fix heading hierarchy - ensure no skipped levels
 */
function fixHeadingOrder(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let lastLevel = 0;

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s(.*)/);
    if (match !== null) {
      const currentLevel = (match[1] as string).length;

      // If we skipped a level, add intermediate headings
      if (currentLevel > lastLevel + 1 && lastLevel > 0) {
        // Skip auto-fix for this case - too complex
        result.push(line);
      } else {
        result.push(line);
      }
      lastLevel = currentLevel;
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Add language identifier to code blocks that are missing one
 */
function fixCodeBlockLanguage(content: string, defaultLanguage = 'text'): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Opening code block
        if (line.trim() === '```') {
          // No language specified
          result.push(`\`\`\`${defaultLanguage}`);
        } else {
          result.push(line);
        }
        inCodeBlock = true;
      } else {
        // Closing code block
        result.push(line);
        inCodeBlock = false;
      }
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * Format tables consistently — pad columns to equal width
 */
function fixTableFormat(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';

    // Detect table start (header row)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const nextLine = lines[i + 1]?.trim() ?? '';
      // Check if next line is a separator row
      if (nextLine.startsWith('|') && /^[|\s:-]+$/.test(nextLine)) {
        // Collect all table lines
        const tableLines: string[] = [line];
        let j = i + 1;
        while (j < lines.length) {
          const tl = lines[j]?.trim() ?? '';
          if (!tl.startsWith('|') || !tl.endsWith('|')) {
            break;
          }
          tableLines.push(lines[j] ?? '');
          j++;
        }

        // Parse cells for each row
        const parsed = tableLines.map((tl) => {
          let trimmed = tl.trim();
          if (trimmed.startsWith('|')) {
            trimmed = trimmed.slice(1);
          }
          if (trimmed.endsWith('|')) {
            trimmed = trimmed.slice(0, -1);
          }
          return trimmed.split('|').map((cell) => cell.trim());
        });

        // Compute max width for each column
        const colCount = parsed[0]?.length ?? 0;
        const colWidths: number[] = new Array(colCount).fill(3);
        for (const row of parsed) {
          for (let c = 0; c < row.length; c++) {
            const cell = row[c] ?? '';
            // Skip separator cells for width calculation
            if (/^:?-+:?$/.test(cell)) {
              continue;
            }
            colWidths[c] = Math.max(colWidths[c] ?? 3, cell.length);
          }
        }

        // Rebuild table with padded cells
        for (let r = 0; r < parsed.length; r++) {
          const row = parsed[r] ?? [];
          const isSeparator = r === 1; // separator is always second row
          const cells = [];
          for (let c = 0; c < colCount; c++) {
            const width = colWidths[c] ?? 3;
            if (isSeparator) {
              cells.push('-'.repeat(width));
            } else {
              cells.push((row[c] ?? '').padEnd(width));
            }
          }
          result.push(`| ${cells.join(' | ')} |`);
        }

        i = j;
        continue;
      }
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}

/**
 * Add missing required section headers based on document type
 */
function fixAddMissingSections(content: string, isSkill: boolean): string {
  const requiredSections = isSkill
    ? ['Capability', 'MCP Tools', 'Usage Examples', 'Error Handling', 'Security Considerations']
    : [
        'What this is',
        'Architecture Overview',
        'Skill System',
        'MCP Integration',
        'Security Considerations',
        'Observability',
        'Checklist: Production Readiness',
      ];

  const existingHeadings = new Set<string>();
  for (const line of content.split('\n')) {
    const match = line.match(/^##\s+(.+)$/);
    if (match?.[1] !== undefined) {
      existingHeadings.add(match[1].trim().toLowerCase());
    }
  }

  const missingSections = requiredSections.filter(
    (section) => !existingHeadings.has(section.toLowerCase()),
  );

  if (missingSections.length === 0) {
    return content;
  }

  // Append missing sections at the end
  let result = content.trimEnd();
  for (const section of missingSections) {
    result += `\n\n## ${section}\n\n_Add content for this section._`;
  }

  return result + '\n';
}

/**
 * Run auto-fix on content based on rule IDs
 */
export function runAutoFix(content: string, ruleIds: string[]): string {
  let result = content;

  for (const ruleId of ruleIds) {
    switch (ruleId) {
      case 'trailing-whitespace':
        result = fixTrailingWhitespace(result);
        break;
      case 'heading-order':
        result = fixHeadingOrder(result);
        break;
      case 'no-code-language':
        result = fixCodeBlockLanguage(result);
        break;
      case 'table-format':
        result = fixTableFormat(result);
        break;
      case 'heading-missing': {
        const isSkill = result.includes('skill_id') || result.includes('## Capability');
        result = fixAddMissingSections(result, isSkill);
        break;
      }
      default:
        // No auto-fix available for this rule
        break;
    }
  }

  return result;
}

/**
 * Get list of rules that support auto-fix
 */
export function getAutoFixableRules(): string[] {
  return ['trailing-whitespace', 'no-code-language', 'table-format', 'heading-missing'];
}
