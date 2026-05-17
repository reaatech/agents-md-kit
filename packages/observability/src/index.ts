/**
 * Observability module barrel export
 */

export {
  buildDashboardSummary,
  type DashboardSummary,
  renderDashboardMarkdown,
} from './dashboard.js';
export type { LogEntry } from './logger.js';
export { debug, error, info, LogLevel, log, warn } from './logger.js';
export {
  getMetricsManager,
  METRIC_NAMES,
  type MetricRecorder,
  MetricsManager,
  type OperationType,
  recordOperation,
} from './metrics.js';
