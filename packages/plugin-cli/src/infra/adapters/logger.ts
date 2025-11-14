export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
}

export function createConsoleLogger(prefix = 'plugin-template'): Logger {
  return {
    log(level, message, meta) {
      const formatted = `[${level.toUpperCase()}][${prefix}] ${message}`;
      if (meta) {
        console.log(formatted, meta);
      } else {
        console.log(formatted);
      }
    }
  };
}


