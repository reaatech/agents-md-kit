/**
 * Observability module barrel export
 */

export { log, info, error, warn, debug, LogLevel } from './logger.js';
export type { LogEntry } from './logger.js';
export { 
  MetricsManager, 
  getMetricsManager, 
  recordOperation,
  type MetricRecorder,
  METRIC_NAMES,
  type OperationType,
} from './metrics.js';
export { buildDashboardSummary, renderDashboardMarkdown, type DashboardSummary } from './dashboard.js';
