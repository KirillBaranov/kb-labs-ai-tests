/**
 * @module Logger adapter for AI Tests plugin
 * Wrapper around @kb-labs/core-sys/logging
 * 
 * Prefers ctx.runtime.log if available (unified logging through runtime)
 * Falls back to direct getLogger if runtime.log is not available
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
 * - If ctx is provided and has runtime.log, uses ctx.runtime.log (preferred)
 * - Otherwise uses getLogger from @kb-labs/core-sys/logging
 * 
 * @param prefix - Logger category prefix
 * @param ctx - Optional plugin context with runtime.log
 */
export function createConsoleLogger(
  prefix = 'ai-tests',
  ctx?: {
    runtime?: {
      log?: (
        level: 'debug' | 'info' | 'warn' | 'error',
        msg: string,
        meta?: Record<string, unknown>
      ) => void;
    };
  }
): Logger {
  // If ctx.runtime.log is available, use unified plugin logger
  if (ctx?.runtime?.log) {
    const pluginLogger = createPluginLogger(ctx, `ai-tests:${prefix}`);
    return {
      log(level, message, meta) {
        pluginLogger.log(level, message, meta);
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


