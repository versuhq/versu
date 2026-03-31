import * as core from "@actions/core";
import type { Logger } from "@versu/core";

/**
 * Serializes a single context value to a string.
 * Objects and arrays are JSON-stringified; primitives use `String()`.
 */
function formatElement(element: unknown): string {
  if (typeof element === "object" && element !== null) {
    return JSON.stringify(element);
  }
  return String(element);
}

/**
 * Combines a log message with an optional structured context object into a
 * human-readable string, choosing the most compact layout that remains legible:
 *
 * - **No context** — returns the message as-is.
 * - **Inline** — `message (key=value …)` when there are ≤ 3 non-array keys and
 *   the total serialized length is under 80 characters.
 * - **Multi-line** — indented `key: value` lines when the context is large or
 *   contains array values.
 *
 * Array values are always rendered as a bulleted list; empty arrays become `none`.
 *
 * @param message - The log message or an `Error` (serialized via `.toString()`).
 * @param context - Optional key/value pairs to attach to the message.
 */
function formatMessage(
  message: string | Error,
  context?: Record<string, unknown>,
): string {
  const result = message instanceof Error ? message.toString() : message;
  
  if (!context || Object.keys(context).length === 0) {
    return result;
  }

  const entries = Object.entries(context);
  
  // Check if we have any arrays
  const hasArrays = entries.some(([_, value]) => Array.isArray(value) && value.length > 0);
  
  // If we have arrays, always use multi-line format
  if (hasArrays) {
    const lines: string[] = [];
    
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(`  ${key}: none`);
        } else {
          lines.push(`  ${key}:`);
          value.forEach(item => {
            const itemStr = formatElement(item);
            lines.push(`    - ${itemStr}`);
          });
        }
      } else {
        const valueStr = formatElement(value);
        lines.push(`  ${key}: ${valueStr}`);
      }
    }
    
    return `${result}\n${lines.join("\n")}`;
  }
  
  // Calculate inline length for non-array entries
  const totalLength = entries.reduce((sum, [key, value]) => {
    const valueStr = formatElement(value);
    return sum + key.length + valueStr.length;
  }, 0);
  
  // Use inline format for simple cases: <= 3 keys and reasonable total length
  if (entries.length <= 3 && totalLength < 80) {
    const inline = entries
      .map(([key, value]) => {
        const valueStr = formatElement(value);
        return `${key}=${valueStr}`;
      })
      .join(" ");
    return `${result} (${inline})`;
  }
  
  // Use multi-line format for complex cases
  const multiline = entries
    .map(([key, value]) => {
      const valueStr = formatElement(value);
      return `  ${key}: ${valueStr}`;
    })
    .join("\n");
  return `${result}\n${multiline}`;
}

/**
 * GitHub Actions implementation of the `@versu/core` {@link Logger} interface.
 *
 * Delegates to the `@actions/core` logging primitives so that messages appear
 * in the Actions run log with the correct severity annotations. Each instance
 * carries an optional **base context** that is merged into every log call,
 * making it easy to attach persistent metadata (e.g. `{ step: "lint" }`)
 * without repeating it on every call site.
 *
 * Use {@link child} to derive a new logger that inherits the current context
 * and extends it with additional fields.
 */
export class ActionsLogger implements Logger {
  private readonly context: Record<string, unknown>;

  /**
   * @param context - Key/value pairs that will be merged into every log entry
   *   produced by this logger instance. Defaults to an empty object.
   */
  constructor(context: Record<string, unknown> = {}) {
    this.context = context;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    core.debug(formatMessage(message, { ...this.context, ...context }));
  }
  info(message: string, context?: Record<string, unknown>): void {
    core.info(formatMessage(message, { ...this.context, ...context }));
  }
  warning(message: string | Error, context?: Record<string, unknown>): void {
    core.warning(formatMessage(message, { ...this.context, ...context }));
  }
  error(message: string | Error, context?: Record<string, unknown>): void {
    core.error(formatMessage(message, { ...this.context, ...context }));
  }

  /** Returns a new `ActionsLogger` whose base context is the merge of this
   *  instance's context and the provided `context` object. */
  child(context: Record<string, unknown>): Logger {
    return new ActionsLogger({ ...this.context, ...context });
  }

  /** Wraps `fn` in a collapsible Actions log group named `name`. */
  group<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return core.group(name, fn);
  }

  /** Opens a collapsible log group. Must be paired with {@link endGroup}. */
  startGroup(name: string): void {
    core.startGroup(name);
  }

  /** Closes the most recently opened log group. */
  endGroup(): void {
    core.endGroup();
  }
}
