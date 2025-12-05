import { describe, expect, it } from 'vitest';
import {
  LogContext,
  LogLevel,
  LogSink,
  createMicrofrontendObservability,
} from '../src/mfeo';
import { MultiplexLogSink } from '../src';

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

  it('fans out to multiple sinks and tolerates sink failures', () => {
    const sinkA = new MemorySink();
    const sinkB = new MemorySink();
    const throwingSink: LogSink = {
      log() {
        throw new Error('boom');
      },
    };

    const observability = createMicrofrontendObservability(
      new MultiplexLogSink([sinkA, sinkB, throwingSink]),
    );

    observability.registerMicrofrontend({
      id: 'mfe_catalog',
      name: 'catalog',
      version: '1.0.0',
    });

    const logger = observability.createLogger('mfe_catalog');
    logger.warn('ITEM_VIEWED', { sku: 'SKU-123' });

    expect(sinkA.entries).toHaveLength(1);
    expect(sinkB.entries).toHaveLength(1);
    expect(sinkA.entries[0]).toMatchObject({ level: 'warn', message: 'ITEM_VIEWED' });
    expect(sinkB.entries[0]).toMatchObject({ level: 'warn', message: 'ITEM_VIEWED' });
  });
});