/**
 * Template processing engine for scaffold generation
 * Uses simple string replacement for template variables
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Template variable context
 */
export interface TemplateContext {
  [key: string]: string | string[] | boolean | number;
}

/**
 * Compile a template string with variable substitution
 */
export function compileTemplate(template: string, context: TemplateContext): string {
  let result = template;

  for (const [key, value] of Object.entries(context)) {
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    if (Array.isArray(value)) {
      result = result.replace(placeholder, value.join('\n'));
    } else if (typeof value === 'boolean') {
      result = result.replace(placeholder, String(value));
    } else if (typeof value === 'number') {
      result = result.replace(placeholder, String(value));
    } else {
      result = result.replace(placeholder, value);
    }
  }

  // Remove any remaining unmatched placeholders
  result = result.replace(/\{\{\s*\w+\s*\}\}/g, '');

  return result;
}

/**
 * Load a template file from the templates directory
 */
export function loadTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Get list of available templates
 */
export function getAvailableTemplates(): string[] {
  const templatesDir = path.join(__dirname, '../templates');

  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  return fs
    .readdirSync(templatesDir)
    .filter((file) => file.endsWith('.hbs'))
    .map((file) => file.replace('.hbs', ''));
}
