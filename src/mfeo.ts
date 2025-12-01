/**
 * Supported log levels for sinks and loggers.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'log';

/**
 * Arbitrary log context map.
 */
export interface LogContext {
  [key: string]: unknown;
}

/**
 * A sink transports logs to a destination such as console or Datadog.
 */
export interface LogSink {
  log(level: LogLevel, message: string, context?: LogContext): void;
}

/**
 * Metadata describing a microfrontend.
 */
export interface MicrofrontendInfo {
  id: string;
  name: string;
  version: string;
  team?: string;
  domain?: string;
  [extra: string]: unknown;
}

/**
 * Logger with microfrontend metadata baked in.
 */
export interface MfeLogger {
  debug(message: string, ctx?: LogContext): void;
  info(message: string, ctx?: LogContext): void;
  warn(message: string, ctx?: LogContext): void;
  error(message: string, ctx?: LogContext): void;
  log(message: string, ctx?: LogContext): void;
}

/**
 * Main registry/manager interface.
 */
export interface MicrofrontendObservability {
  /**
   * Register or update metadata for a microfrontend.
   */
  registerMicrofrontend(info: MicrofrontendInfo): void;

  /**
   * Create a logger bound to a given microfrontend id.
   */
  createLogger(mfeId: string): MfeLogger;
}

/**
 * Microfrontend-aware observability registry implementation.
 */
export class MicrofrontendObservabilityImpl implements MicrofrontendObservability {
  private readonly registry = new Map<string, MicrofrontendInfo>();

  constructor(private readonly sink: LogSink) {}

  registerMicrofrontend(info: MicrofrontendInfo): void {
    if (!info.id || typeof info.id !== 'string' || info.id.trim() === '') {
      throw new Error('Microfrontend info must include a non-empty id.');
    }
    this.registry.set(info.id, info);
  }

  createLogger(mfeId: string): MfeLogger {
    const info = this.registry.get(mfeId);
    if (!info) {
      throw new Error(
        `Unknown microfrontend id "${mfeId}". Did you call registerMicrofrontend?`,
      );
    }

    const logWithMetadata =
      (level: LogLevel) =>
      (message: string, ctx?: LogContext): void => {
        const mergedContext: LogContext = {
          ...(ctx ?? {}),
          mfe_id: info.id,
          mfe_name: info.name,
          mfe_version: info.version,
          team: info.team,
          domain: info.domain,
        };
        this.sink.log(level, message, mergedContext);
      };

    return {
      debug: logWithMetadata('debug'),
      info: logWithMetadata('info'),
      warn: logWithMetadata('warn'),
      error: logWithMetadata('error'),
      log: logWithMetadata('log'),
    };
  }
}

/**
 * Convenience factory for creating the observability registry.
 */
export function createMicrofrontendObservability(
  sink: LogSink,
): MicrofrontendObservability {
  return new MicrofrontendObservabilityImpl(sink);
}
