# microfrontend-observability

Vendor-neutral logging helpers for browser-based microfrontends. Instead of forcing each MFE to remember to attach metadata, this tiny library hands out per-MFE loggers that automatically enrich every log with standardized `mfe_*` fields before handing it off to the sink of your choice.

## Install

```bash
npm install microfrontend-observability
```

## Quick start

```ts
import {
  createMicrofrontendObservability,
  ConsoleLogSink,
} from 'microfrontend-observability';

const sink = new ConsoleLogSink();
const observability = createMicrofrontendObservability(sink);

observability.registerMicrofrontend({
  id: 'mfe_checkout',
  name: 'checkout',
  version: '3.4.1',
  team: 'team_payments',
  domain: 'commerce',
});

const checkoutLogger = observability.createLogger('mfe_checkout');
checkoutLogger.error('PAYMENT_FAILED', { orderId: '12345' });
```

Every log emitted through `checkoutLogger` is automatically enriched with:

```json
{
  "orderId": "12345",
  "mfe_id": "mfe_checkout",
  "mfe_name": "checkout",
  "mfe_version": "3.4.1",
  "team": "team_payments",
  "domain": "commerce"
}
```

## Adapter examples

- **Console** – included for local development.

  ```ts
  import { ConsoleLogSink } from 'microfrontend-observability';
  const sink = new ConsoleLogSink();
  ```

- **Datadog Logs** – wrap `@datadog/browser-logs` without adding a hard dependency.

  ```ts
  import { datadogLogs } from '@datadog/browser-logs';
  import {
    createMicrofrontendObservability,
    DatadogLogsSink,
  } from 'microfrontend-observability';

  datadogLogs.init({
    clientToken: 'xxx',
    site: 'datadoghq.com',
    forwardErrorsToLogs: true,
  });

  const sink = new DatadogLogsSink(datadogLogs.logger);
  const observability = createMicrofrontendObservability(sink);
  // register MFEs and log as shown above
  ```

Add your own sinks by implementing the `LogSink` interface.

## Design goals

- Single SDK instance for the shell, shared by all MFEs.
- Per-MFE loggers avoid manipulating global mutable context.
- Vendor-neutral sinks so you can forward to whatever logging or tracing system you choose.

## License

MIT © microfrontend-observability contributors
