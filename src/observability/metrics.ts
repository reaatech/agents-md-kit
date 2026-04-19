/**
 * OpenTelemetry metrics implementation
 */

import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import type { Meter, Counter, Histogram, Attributes } from '@opentelemetry/api';
import { metrics } from '@opentelemetry/api';

/**
 * Metric names for agents-md-kit
 */
export const METRIC_NAMES = {
  OPERATIONS_TOTAL: 'agents_md_kit.operations.total',
  OPERATIONS_DURATION_MS: 'agents_md_kit.operations.duration_ms',
  VALIDATION_ERRORS: 'agents_md_kit.validation.errors',
  VALIDATION_WARNINGS: 'agents_md_kit.validation.warnings',
  LINTING_WARNINGS: 'agents_md_kit.linting.warnings',
  LINTING_ERRORS: 'agents_md_kit.linting.errors',
  FILES_PROCESSED: 'agents_md_kit.files.processed',
  SCAFFOLD_GENERATIONS: 'agents_md_kit.scaffold.generations',
} as const;

/**
 * Operation types for metrics
 */
export type OperationType = 
  | 'parse' 
  | 'validate' 
  | 'lint' 
  | 'scaffold' 
  | 'format'
  | 'report';

/**
 * Metric recording interface
 */
export interface MetricRecorder {
  recordOperation(operation: OperationType, success: boolean, durationMs: number): void;
  recordValidationErrors(count: number, docType?: string): void;
  recordValidationWarnings(count: number, docType?: string): void;
  recordLintErrors(count: number, docType?: string): void;
  recordLintWarnings(count: number, docType?: string): void;
  recordFileProcessed(docType?: string): void;
  recordScaffoldGeneration(agentType: string, skillCount: number): void;
}

/**
 * Metrics manager for agents-md-kit
 */
export class MetricsManager implements MetricRecorder {
  private meter: Meter;
  private provider: MeterProvider;
  private operationsCounter: Counter;
  private operationsHistogram: Histogram;
  private validationErrorsCounter: Counter;
  private validationWarningsCounter: Counter;
  private lintErrorsCounter: Counter;
  private lintWarningsCounter: Counter;
  private filesProcessedCounter: Counter;
  private scaffoldGenerationsCounter: Counter;

  constructor(serviceName: string = 'agents-md-kit', serviceVersion: string = '1.0.0') {
    const resource = new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
    });

    this.provider = new MeterProvider({ resource });
    
    metrics.setGlobalMeterProvider(this.provider);

    this.meter = this.provider.getMeter(serviceName);

    // Initialize counters and histograms
    this.operationsCounter = this.meter.createCounter(METRIC_NAMES.OPERATIONS_TOTAL, {
      description: 'Total number of operations performed',
    });

    this.operationsHistogram = this.meter.createHistogram(METRIC_NAMES.OPERATIONS_DURATION_MS, {
      description: 'Duration of operations in milliseconds',
      advice: { explicitBucketBoundaries: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000] },
    });

    this.validationErrorsCounter = this.meter.createCounter(METRIC_NAMES.VALIDATION_ERRORS, {
      description: 'Total number of validation errors',
    });

    this.validationWarningsCounter = this.meter.createCounter(METRIC_NAMES.VALIDATION_WARNINGS, {
      description: 'Total number of validation warnings',
    });

    this.lintErrorsCounter = this.meter.createCounter(METRIC_NAMES.LINTING_ERRORS, {
      description: 'Total number of linting errors',
    });

    this.lintWarningsCounter = this.meter.createCounter(METRIC_NAMES.LINTING_WARNINGS, {
      description: 'Total number of linting warnings',
    });

    this.filesProcessedCounter = this.meter.createCounter(METRIC_NAMES.FILES_PROCESSED, {
      description: 'Total number of files processed',
    });

    this.scaffoldGenerationsCounter = this.meter.createCounter(METRIC_NAMES.SCAFFOLD_GENERATIONS, {
      description: 'Total number of scaffold generations',
    });
  }

  /**
   * Record an operation with timing
   */
  recordOperation(operation: OperationType, success: boolean, durationMs: number): void {
    const attributes: Attributes = {
      operation,
      success: success.toString(),
    };

    this.operationsCounter.add(1, attributes);
    this.operationsHistogram.record(durationMs, attributes);
  }

  /**
   * Record validation errors
   */
  recordValidationErrors(count: number, docType: string = 'unknown'): void {
    this.validationErrorsCounter.add(count, { doc_type: docType });
  }

  /**
   * Record validation warnings
   */
  recordValidationWarnings(count: number, docType: string = 'unknown'): void {
    this.validationWarningsCounter.add(count, { doc_type: docType });
  }

  /**
   * Record linting errors
   */
  recordLintErrors(count: number, docType: string = 'unknown'): void {
    this.lintErrorsCounter.add(count, { doc_type: docType });
  }

  /**
   * Record linting warnings
   */
  recordLintWarnings(count: number, docType: string = 'unknown'): void {
    this.lintWarningsCounter.add(count, { doc_type: docType });
  }

  /**
   * Record a file being processed
   */
  recordFileProcessed(docType: string = 'unknown'): void {
    this.filesProcessedCounter.add(1, { doc_type: docType });
  }

  /**
   * Record a scaffold generation
   */
  recordScaffoldGeneration(agentType: string, skillCount: number): void {
    this.scaffoldGenerationsCounter.add(1, {
      agent_type: agentType,
      skill_count: skillCount.toString(),
    });
  }

  /**
   * Shutdown the metrics provider
   */
  async shutdown(): Promise<void> {
    await this.provider.shutdown();
  }
}

/**
 * Default metrics manager instance
 */
let defaultMetricsManager: MetricsManager | null = null;

/**
 * Get or create the default metrics manager
 */
export function getMetricsManager(): MetricsManager {
  defaultMetricsManager ??= new MetricsManager();
  return defaultMetricsManager;
}

/**
 * Record metrics for an operation
 */
export async function recordOperation<T>(
  operation: OperationType,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const durationMs = Date.now() - startTime;
    getMetricsManager().recordOperation(operation, true, durationMs);
    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    getMetricsManager().recordOperation(operation, false, durationMs);
    throw error;
  }
}
