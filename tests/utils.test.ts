/**
 * Unit tests for shared utilities
 */

import { describe, it, expect } from 'vitest';
import {
  assertNever,
  delay,
  randomId,
  sanitizePath,
  normalizeLineEndings,
  truncate,
  debounce,
  groupBy,
} from '../src/utils/index.js';

describe('utils', () => {
  describe('assertNever', () => {
    it('should throw an error when called', () => {
      expect(() => assertNever('test' as never)).toThrow('Unexpected value: "test"');
    });

    it('should throw with stringified object', () => {
      expect(() => assertNever({ key: 'value' } as never)).toThrow(
        'Unexpected value: {"key":"value"}',
      );
    });
  });

  describe('delay', () => {
    it('should resolve after specified milliseconds', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(45);
    });
  });

  describe('randomId', () => {
    it('should return a valid UUID-like string', () => {
      const id = randomId();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should generate unique ids', () => {
      const id1 = randomId();
      const id2 = randomId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('sanitizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(sanitizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
    });

    it('should leave forward slashes unchanged', () => {
      expect(sanitizePath('foo/bar/baz')).toBe('foo/bar/baz');
    });

    it('should handle mixed paths', () => {
      expect(sanitizePath('foo\\bar/baz\\qux')).toBe('foo/bar/baz/qux');
    });
  });

  describe('normalizeLineEndings', () => {
    it('should convert CRLF to LF', () => {
      expect(normalizeLineEndings('foo\r\nbar\r\nbaz')).toBe('foo\nbar\nbaz');
    });

    it('should leave LF unchanged', () => {
      expect(normalizeLineEndings('foo\nbar\nbaz')).toBe('foo\nbar\nbaz');
    });

    it('should handle text without CRLF', () => {
      expect(normalizeLineEndings('foo\nbar')).toBe('foo\nbar');
    });
  });

  describe('truncate', () => {
    it('should return text unchanged if under maxLength', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate text exceeding maxLength', () => {
      expect(truncate('hello world', 5)).toBe('he...');
    });

    it('should handle exact maxLength', () => {
      expect(truncate('hello', 5)).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('');
    });

    it('should handle maxLength of 3', () => {
      expect(truncate('hello', 3)).toBe('...');
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      let callCount = 0;
      const fn = debounce(() => {
        callCount++;
      }, 50);

      fn();
      fn();
      fn();

      expect(callCount).toBe(0);

      await delay(60);
      expect(callCount).toBe(1);
    });

    it('should pass arguments to debounced function', async () => {
      let lastArg: unknown = 0;
      const fn = debounce((arg: unknown) => {
        lastArg = arg;
      }, 50);

      fn(42);
      await delay(60);

      expect(lastArg).toBe(42);
    });
  });

  describe('groupBy', () => {
    it('should group array items by key', () => {
      const items = [
        { type: 'a', value: 1 },
        { type: 'b', value: 2 },
        { type: 'a', value: 3 },
      ];

      const result = groupBy(items, (item) => item.type);

      expect(result.a).toHaveLength(2);
      expect(result.b).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const result = groupBy<{ key: string }, string>([], (item: { key: string }) => item.key);
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should handle all items having same key', () => {
      const items = [
        { type: 'same', value: 1 },
        { type: 'same', value: 2 },
      ];

      const result = groupBy(items, (item) => item.type);

      expect(result.same).toHaveLength(2);
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should support numeric keys', () => {
      const items = [1, 2, 3, 4, 5];

      const result = groupBy<number, string>(items, (n: number) => (n % 2 === 0 ? 'even' : 'odd'));

      expect(result.even).toHaveLength(2);
      expect(result.odd).toHaveLength(3);
    });
  });
});
