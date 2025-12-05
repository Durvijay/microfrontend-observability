import { LogContext, LogLevel, LogSink } from '../mfeo';

/**
 * Log sink that fans out log events to multiple sinks.
 */
export class MultiplexLogSink implements LogSink {
  constructor(private readonly sinks: readonly LogSink[]) {
    if (!sinks || sinks.length === 0) {
      throw new Error('MultiplexLogSink requires at least one sink.');
    }
  }

  log(level: LogLevel, message: string, context?: LogContext): void {
    for (const sink of this.sinks) {
      try {
        sink.log(level, message, context);
      } catch (error) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
          console.error(
            '[MultiplexLogSink] Sink threw while handling log; continuing with others.',
            error,
          );
        }
      }
    }
  }
}
