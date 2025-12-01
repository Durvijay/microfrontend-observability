import { describe, expect, it } from 'vitest';
import {
  LogContext,
  LogLevel,
  LogSink,
  createMicrofrontendObservability,
} from '../src/mfeo';

class MemorySink implements LogSink {
  public entries: Array<{ level: LogLevel; message: string; context?: LogContext }> = [];

  log(level: LogLevel, message: string, context?: LogContext): void {
    this.entries.push({ level, message, context });
  }
}

describe('Microfrontend observability', () => {
  it('enriches logs with microfrontend metadata', () => {
    const sink = new MemorySink();
    const observability = createMicrofrontendObservability(sink);
    observability.registerMicrofrontend({
      id: 'mfe_checkout',
      name: 'checkout',
      version: '3.4.1',
      team: 'team_payments',
      domain: 'commerce',
    });

    const logger = observability.createLogger('mfe_checkout');
    logger.info('ORDER_PLACED', { orderId: '12345' });

    expect(sink.entries).toHaveLength(1);
    expect(sink.entries[0]).toMatchObject({
      level: 'info',
      message: 'ORDER_PLACED',
      context: {
        orderId: '12345',
        mfe_id: 'mfe_checkout',
        mfe_name: 'checkout',
        mfe_version: '3.4.1',
        team: 'team_payments',
        domain: 'commerce',
      },
    });
  });

  it('throws when creating a logger for an unknown microfrontend id', () => {
    const observability = createMicrofrontendObservability(new MemorySink());
    expect(() => observability.createLogger('missing')).toThrowError(
      /Unknown microfrontend id/,
    );
  });
});
