/**
 * @module Logger adapter for AI Tests plugin
 * Wrapper around @kb-labs/core-sys/logging
 *
 * Prefers ctx.logger if available (unified logging through runtime)
 * Falls back to direct getLogger if logger is not available
 */

import { getLogger, type Logger as CoreLogger } from '@kb-labs/core-sys/logging';
import { createPluginLogger, type PluginLogger } from '@kb-labs/plugin-runtime';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void;
}

/**
 * Create console logger adapter
 *
 * Uses unified logging system:
 * - If ctx is provided and has logger, uses ctx.logger (preferred)
 * - Otherwise uses getLogger from @kb-labs/core-sys/logging
 *
 * @param prefix - Logger category prefix
 * @param ctx - Optional plugin context with logger
 */
export function createConsoleLogger(
  prefix = 'ai-tests',
  ctx?: {
    logger?: {
      debug: (msg: string, meta?: Record<string, unknown>) => void;
      info: (msg: string, meta?: Record<string, unknown>) => void;
      warn: (msg: string, meta?: Record<string, unknown>) => void;
      error: (msg: string, meta?: Record<string, unknown>) => void;
    };
  }
): Logger {
  // If ctx.logger is available, use unified plugin logger
  if (ctx?.logger) {
    return {
      log(level, message, meta) {
        switch (level) {
          case 'debug':
            ctx.logger.debug(message, meta);
            break;
          case 'info':
            ctx.logger.info(message, meta);
            break;
          case 'warn':
            ctx.logger.warn(message, meta);
            break;
          case 'error':
            ctx.logger.error(message, meta);
            break;
        }
      }
    };
  }
  
  // Fallback: use core logging system directly
  const coreLogger = getLogger(`ai-tests:${prefix}`);
  
  return {
    log(level, message, meta) {
      switch (level) {
        case 'debug':
          coreLogger.debug(message, meta);
          break;
        case 'info':
          coreLogger.info(message, meta);
          break;
        case 'warn':
          coreLogger.warn(message, meta);
          break;
        case 'error':
          coreLogger.error(message, meta);
          break;
      }
    }
  };
}


