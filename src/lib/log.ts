import winston from "winston";

const consoleFilter = winston.format((info) => {
  if (
    info.destination === "all" ||
    (info.destination && info.destination === "console")
  ) {
    return info;
  }
  return false;
});

const fileFilter = winston.format((info) => {
  if (
    info.destination === "all" ||
    (info.destination && info.destination === "file")
  ) {
    return info;
  }
  return false;
});

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        consoleFilter()
      ),
    }),

    new winston.transports.File({
      filename: "app.log",
      level: "info",
      format: winston.format.combine(winston.format.simple(), fileFilter()),
    }),
  ],
});

export const startPeriodicReporting = (
  progress: { processed: number },
  interval: number
) => {
  //   const intervalId = setInterval(() => {
  //     logger.info(`Processed ${progress.processed} resources so far.`, {
  //       destination: "console",
  //     });
  //   }, interval);
  //   return intervalId;
};
