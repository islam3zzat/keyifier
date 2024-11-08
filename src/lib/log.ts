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
export const logger = createLogger({
  format: combinedFormat,
  transports: [...newFileTransport()],
  exitOnError: false,
});

// const consoleFilter = winston.format((info) => {
//   if (
//     info.destination === "all" ||
//     (info.destination && info.destination === "console")
//   ) {
//     return info;
//   }
//   return false;
// });

// const fileFilter = winston.format((info) => {
//   if (
//     info.destination === "all" ||
//     (info.destination && info.destination === "file")
//   ) {
//     return info;
//   }
//   return false;
// });

// export const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.printf(({ timestamp, level, message }) => {
//       return `${timestamp} [${level}]: ${message}`;
//     })
//   ),
//   transports: [
//     new winston.transports.Console({
//       level: "info",
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.simple(),
//         consoleFilter()
//       ),
//     }),

//     new winston.transports.File({
//       filename: "app.log",
//       level: "info",
//       format: winston.format.combine(winston.format.simple(), fileFilter()),
//     }),
//   ],
// });
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
// export const startPeriodicReporting = (
//   progress: { processed: number },
//   interval: number
// ) => {
//   //   const intervalId = setInterval(() => {
//   //     logger.info(`Processed ${progress.processed} resources so far.`, {
//   //       destination: "console",
//   //     });
//   //   }, interval);
//   //   return intervalId;
// };

// const createLogger = (destination: "file" | "console" | "all") => {
//   const logger = winston.createLogger({

// };
