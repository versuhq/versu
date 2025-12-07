export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warning(message: string | Error, context?: Record<string, unknown>): void;
  error(message: string | Error, context?: Record<string, unknown>): void;
}

// default no-op
const noopLogger: Logger = {
  debug: (_message: string) => {},
  info: (_message: string) => {},
  warning: (_message: string | Error, _context?: Record<string, unknown>) => {},
  error: (_message: string | Error, _context?: Record<string, unknown>) => {},
};

let _current: Logger = noopLogger;

export function initLogger(logger: Logger) {
  _current = logger;
}

/**
 * Convenience proxy so existing call sites can
 * import `logger` and call methods. The proxy delegates
 * to the mutable `_current` at call-time.
 */
export const logger: Logger = {
  debug: (message: string) => _current.debug(message),
  info: (message: string) => _current.info(message),
  warning: (message: string | Error, context?: Record<string, unknown>) =>
    _current.warning(message, context),
  error: (message: string | Error, context?: Record<string, unknown>) =>
    _current.error(message, context),
};
