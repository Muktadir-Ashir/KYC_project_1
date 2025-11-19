import fs from "fs";
import path from "path";

type LogLevel = "info" | "warn" | "error" | "debug";

const LOG_DIR = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const writeToFile = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level,
    message,
    meta,
  };
  fs.appendFile(LOG_FILE, JSON.stringify(payload) + "\n", (err) => {
    if (err) {
      console.error("Failed to write log file:", err);
    }
  });
};

const logToConsole = (level: LogLevel, message: string, meta?: unknown) => {
  const timestamp = new Date().toISOString();
  const serializedMeta =
    meta && typeof meta === "object" ? JSON.stringify(meta) : meta ?? "";
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}${
    serializedMeta ? ` ${serializedMeta}` : ""
  }`;

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "debug":
      console.debug(line);
      break;
    default:
      console.log(line);
  }
};

const log = (level: LogLevel, message: string, meta?: unknown) => {
  logToConsole(level, message, meta);
  writeToFile(level, message, meta);
};

export const logger = {
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
};
