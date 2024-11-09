import { createLogger, transports } from "winston";
import { format, TransformableInfo } from "logform";

const customFormat = format.printf(
  ({ level, message, timestamp, stack }: TransformableInfo) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  }
);

const combinedFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json(),
  customFormat
);

const newConsoleTransport = () =>
  new transports.Console({
    format: format.combine(format.colorize(), customFormat),
  });

const newFileTransport = () => [
  new transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  new transports.File({ filename: "logs/combined.log" }),
];

export const consoleLogger = createLogger({
  format: combinedFormat,
  transports: [newConsoleTransport()],
  exitOnError: false,
});
export const fileLogger = createLogger({
  format: combinedFormat,
  transports: newFileTransport(),
  exitOnError: false,
});

export const startPeriodicReporting = (
  progress: { processed: number },
  period: number
) => {
  let lastProcessed = progress.processed;

  var intervalId = setInterval(() => {
    const processed = progress.processed;

    if (processed === lastProcessed) {
      clearInterval(intervalId);
      return;
    }

    if (processed > 0) {
      consoleLogger.info(`Processed ${processed} resources so far.`, {
        destination: "console",
      });
    }

    lastProcessed = processed;
  }, period);
};
