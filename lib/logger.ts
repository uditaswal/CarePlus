import "server-only";

import { randomUUID } from "crypto";
import { mkdir, readdir, rm, stat, appendFile } from "fs/promises";
import path from "path";

type LogLevel = "INFO" | "WARN" | "ERROR";

type LogEntry = {
  timestamp: string;
  level: LogLevel;
  category: string;
  event: string;
  message: string;
  requestId?: string;
  data?: Record<string, unknown>;
};

const LOG_DIR = path.join(process.cwd(), "log");
const LOG_RETENTION_DAYS = 15;
const REDACTED_KEYS = [
  "password",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "secret",
  "authorization",
  "cookie",
];

function getLogFilePath(date = new Date()) {
  const fileName = `${date.toISOString().slice(0, 10)}.log`;
  return path.join(LOG_DIR, fileName);
}

function sanitizeForLogs(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeForLogs);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        REDACTED_KEYS.includes(key) ? "[REDACTED]" : sanitizeForLogs(entry),
      ])
    );
  }

  return value;
}

async function ensureLogDirectory() {
  await mkdir(LOG_DIR, { recursive: true });
}

async function pruneOldLogs() {
  await ensureLogDirectory();

  const files = await readdir(LOG_DIR);
  const cutoff = Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

  await Promise.all(
    files
      .filter((fileName) => fileName.endsWith(".log"))
      .map(async (fileName) => {
        const fullPath = path.join(LOG_DIR, fileName);
        const fileStats = await stat(fullPath);

        if (fileStats.mtimeMs < cutoff) {
          await rm(fullPath, { force: true });
        }
      })
  );
}

const isVercel = process.env.VERCEL === "1";

export async function writeLog(input: Omit<LogEntry, "timestamp">) {
  const entry: LogEntry = {
    ...input,
    timestamp: new Date().toISOString(),
    data: input.data
      ? (sanitizeForLogs(input.data) as Record<string, unknown>)
      : undefined,
  };

  const logMessage = JSON.stringify(entry);

  if (isVercel) {
    switch (entry.level) {
      case "INFO":
        console.log(logMessage);
        break;
      case "WARN":
        console.warn(logMessage);
        break;
      case "ERROR":
        console.error(logMessage);
        break;
    }
  } else {
    await ensureLogDirectory();
    await pruneOldLogs();
    await appendFile(getLogFilePath(), `${logMessage}\n`, "utf8");
  }
}

export function createRequestId() {
  return randomUUID();
}

export function getRequestContext(request: Request) {
  return {
    method: request.method,
    path: new URL(request.url).pathname,
    userAgent: request.headers.get("user-agent"),
    ipAddress:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown",
  };
}

export async function logApiRequest(options: {
  category: string;
  event: string;
  request: Request;
  requestId: string;
  body?: Record<string, unknown>;
}) {
  await writeLog({
    level: "INFO",
    category: options.category,
    event: `${options.event}.request`,
    message: `${options.event} request received`,
    requestId: options.requestId,
    data: {
      ...getRequestContext(options.request),
      body: options.body,
    },
  });
}

export async function logApiResponse(options: {
  category: string;
  event: string;
  request: Request;
  requestId: string;
  status: number;
  startedAt: number;
  body?: Record<string, unknown>;
}) {
  await writeLog({
    level: options.status >= 400 ? "WARN" : "INFO",
    category: options.category,
    event: `${options.event}.response`,
    message: `${options.event} response sent`,
    requestId: options.requestId,
    data: {
      ...getRequestContext(options.request),
      status: options.status,
      durationMs: Date.now() - options.startedAt,
      body: options.body,
    },
  });
}

export async function logError(options: {
  category: string;
  event: string;
  message: string;
  requestId?: string;
  error: unknown;
  data?: Record<string, unknown>;
}) {
  const errorValue = options.error as
    | {
        message?: string;
        stack?: string;
        code?: string | number;
        type?: string;
      }
    | undefined;

  await writeLog({
    level: "ERROR",
    category: options.category,
    event: options.event,
    message: options.message,
    requestId: options.requestId,
    data: {
      ...options.data,
      error: {
        message: errorValue?.message || "Unknown error",
        code: errorValue?.code,
        type: errorValue?.type,
        stack: errorValue?.stack,
      },
    },
  });
}

export async function logInfo(options: {
  category: string;
  event: string;
  message: string;
  requestId?: string;
  data?: Record<string, unknown>;
}) {
  await writeLog({
    level: "INFO",
    category: options.category,
    event: options.event,
    message: options.message,
    requestId: options.requestId,
    data: options.data,
  });
}

export async function logWarn(options: {
  category: string;
  event: string;
  message: string;
  requestId?: string;
  data?: Record<string, unknown>;
}) {
  await writeLog({
    level: "WARN",
    category: options.category,
    event: options.event,
    message: options.message,
    requestId: options.requestId,
    data: options.data,
  });
}
