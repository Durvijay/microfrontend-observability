import { LogContext, LogLevel, LogSink } from '../mfeo';

/**
 * Minimal subset of the Datadog browser logs API required by the sink.
 */
export interface DatadogLoggerLike {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  log(message: string, context?: LogContext): void;
}

/**
 * Sink that forwards logs to the provided Datadog browser logger.
 */
export class DatadogLogsSink implements LogSink {
  constructor(private readonly logger: DatadogLoggerLike) {
    if (!logger) {
      throw new Error('DatadogLogsSink requires a logger instance.');
    }
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    const loggerMethod = (this.logger[level] ??
      this.logger.log) as (message: string, context?: LogContext) => void;
    loggerMethod.call(this.logger, message, context);
  }
}
