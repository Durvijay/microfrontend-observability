import { LogContext, LogLevel, LogSink } from '../mfeo';

/**
 * ConsoleLogSink writes logs to the browser console.
 */
export class ConsoleLogSink implements LogSink {
  log(level: LogLevel, message: string, context: LogContext = {}): void {
    const consoleApi = typeof console !== 'undefined' ? console : undefined;
    const fallback =
      consoleApi && typeof consoleApi.log === 'function'
        ? consoleApi.log.bind(consoleApi)
        : undefined;

    let logFn = fallback;
    if (consoleApi) {
      const consoleMethods = consoleApi as unknown as Record<
        string,
        (...args: unknown[]) => void
      >;
      if (typeof consoleMethods[level] === 'function') {
        logFn = consoleMethods[level].bind(consoleApi);
      }
    }

    const payload = `[${level}] ${message}`;

    if (logFn) {
      logFn(payload, context ?? {});
    }
  }
}
