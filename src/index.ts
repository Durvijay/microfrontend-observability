export {
  createMicrofrontendObservability,
  MicrofrontendObservability,
  MicrofrontendObservabilityImpl,
  MicrofrontendInfo,
  MfeLogger,
  LogSink,
  LogLevel,
  LogContext,
} from './mfeo';

export { ConsoleLogSink } from './adapters/consoleSink';
export { DatadogLogsSink, DatadogLoggerLike } from './adapters/datadogLogsSink';
export { MultiplexLogSink } from './adapters/multiSink';