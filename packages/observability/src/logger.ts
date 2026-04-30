/**
 * Structured logging with PII redaction
 */

import pino, { type Logger as PinoLogger } from 'pino';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  operation: string;
  message: string;
  duration_ms?: number;
  success?: boolean;
  errors?: number;
  warnings?: number;
  request_id?: string;
  [key: string]: unknown;
}

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
];

function redactPII(input: string): string {
  return PII_PATTERNS.reduce((value, pattern) => value.replace(pattern, '[REDACTED]'), input);
}

function redactValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactPII(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item));
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        redactValue(entry),
      ])
    );
  }

  return value;
}

function createBaseLogger(): PinoLogger {
  return pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'agents-md-kit',
    },
    timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label }),
    },
  });
}

let logger = createBaseLogger();

export function setLogger(nextLogger: PinoLogger): void {
  logger = nextLogger;
}

export function log(entry: {
  level: LogLevel;
  service?: string;
  operation: string;
  message: string;
  duration_ms?: number;
  success?: boolean;
  errors?: number;
  warnings?: number;
  request_id?: string;
  [key: string]: unknown;
}): void {
  const { level, message, ...rest } = entry;
  const payload = redactValue({
    service: entry.service ?? 'agents-md-kit',
    duration_ms: entry.duration_ms,
    success: entry.success,
    errors: entry.errors,
    warnings: entry.warnings,
    request_id: entry.request_id,
    ...rest,
  }) as Record<string, unknown>;

  logger[level](payload, redactPII(message));
}

export function info(operation: string, message: string, data?: Record<string, unknown>): void {
  log({
    level: LogLevel.INFO,
    operation,
    message,
    ...data,
  });
}

export function error(operation: string, message: string, data?: Record<string, unknown>): void {
  log({
    level: LogLevel.ERROR,
    operation,
    message,
    ...data,
  });
}

export function warn(operation: string, message: string, data?: Record<string, unknown>): void {
  log({
    level: LogLevel.WARN,
    operation,
    message,
    ...data,
  });
}

export function debug(operation: string, message: string, data?: Record<string, unknown>): void {
  log({
    level: LogLevel.DEBUG,
    operation,
    message,
    ...data,
  });
}
