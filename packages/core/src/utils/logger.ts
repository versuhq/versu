export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warning(message: string | Error, context?: Record<string, unknown>): void;
  error(message: string | Error, context?: Record<string, unknown>): void;

  child(context: Record<string, unknown>): Logger;

  group<T>(name: string, fn: () => Promise<T>): Promise<T>;

  startGroup(name: string): void;
  endGroup(): void;
}

// default no-op
const noopLogger: Logger = {
  debug: (_message: string, _context?: Record<string, unknown>) => {},
  info: (_message: string, _context?: Record<string, unknown>) => {},
  warning: (_message: string | Error, _context?: Record<string, unknown>) => {},
  error: (_message: string | Error, _context?: Record<string, unknown>) => {},
  child: (_context: Record<string, unknown>) => noopLogger,
  group: async <T>(_name: string, fn: () => Promise<T>) => await fn(),
  startGroup: (_name: string) => {},
  endGroup: () => {},
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
  debug: (message: string, context?: Record<string, unknown>) =>
    _current.debug(message, context),
  info: (message: string, context?: Record<string, unknown>) =>
    _current.info(message, context),
  warning: (message: string | Error, context?: Record<string, unknown>) =>
    _current.warning(message, context),
  error: (message: string | Error, context?: Record<string, unknown>) =>
    _current.error(message, context),
  child: (context: Record<string, unknown>) => _current.child(context),
  group: async <T>(name: string, fn: () => Promise<T>) =>
    await _current.group(name, fn),
  startGroup: (name: string) => _current.startGroup(name),
  endGroup: () => _current.endGroup(),
};
