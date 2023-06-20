import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import * as opentelemetry from "@opentelemetry/sdk-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

registerInstrumentations(
    {
        instrumentations : [getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-mongodb' : {
                enabled : false,
            },
            '@opentelemetry/instrumentation-express' : {
                enabled :false,
            },
            '@opentelemetry/instrumentation-fs' : {
                enabled : false,
            }
        }),
        ],
    });

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
export function initializeOpentelemtry(serviceName, otelCollector) {
const exporter = new OTLPTraceExporter({
    url: otelCollector
});

const resource =
    Resource.default().merge(
        new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        })
    );

const sdk = new opentelemetry.NodeSDK({
    resource:resource,
    traceExporter: exporter,
});

sdk
    .start()
    .then(() => {
        console.log("Tracing initialized");
    })
    .catch((error) => console.log("Error initializing tracing", error));

    function shutdown() {
        sdk.shutdown()
            .then(() => console.log('Tracing terminated'))
            .catch((error) => console.log('Error terminating tracing', error))
            .finally(() => process.exit(0));
    }
    process.on('SIGTERM', shutdown)
    process.on('exit', shutdown);
    process.on('SIGINT', shutdown);
}
// module.exports = sdk