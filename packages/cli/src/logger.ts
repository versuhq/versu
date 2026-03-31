import { Command } from "@oclif/core";
import type { Logger } from "@versu/core";
import Debug from "debug";
import chalk from "chalk";
import ora, { Ora } from "ora";

const debug = Debug("versu");

/** Prepends `spaces` space characters to `str`. */
function indent(str: string, spaces: number): string {
  const indentation = " ".repeat(spaces);
  return indentation + str;
}

/**
 * Converts a single context value to a display string.
 * Objects and arrays are JSON-serialised; primitives use `String()`.
 */
function formatElement(element: unknown): string {
  if (typeof element === "object" && element !== null) {
    return JSON.stringify(element);
  }
  return String(element);
}

/**
 * Formats context object for beautiful CLI display
 */
function formatContext(
  context?: Record<string, unknown>,
  baseIndent = 0,
): string {
  if (!context || Object.keys(context).length === 0) return "";

  const entries = Object.entries(context);

  // Check if we have any arrays
  const hasArrays = entries.some(
    ([_, value]) => Array.isArray(value) && value.length > 0,
  );

  // If we have arrays, always use multi-line format with list items
  if (hasArrays) {
    const lineIndent = baseIndent + 2;
    const itemIndent = baseIndent + 4;
    const lines: string[] = [];

    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          lines.push(
            indent(`${chalk.dim(key)}: ${chalk.cyan("none")}`, lineIndent),
          );
        } else {
          lines.push(indent(`${chalk.dim(key)}:`, lineIndent));
          value.forEach((item) => {
            const itemStr = formatElement(item);
            lines.push(
              indent(`${chalk.dim("•")} ${chalk.cyan(itemStr)}`, itemIndent),
            );
          });
        }
      } else {
        const valueStr = formatElement(value);
        lines.push(
          indent(`${chalk.dim(key)}: ${chalk.cyan(valueStr)}`, lineIndent),
        );
      }
    }

    return "\n" + lines.join("\n");
  }

  const processedEntries = entries.map(([key, value]) => {
    const formattedValue = formatElement(value);
    return { key, formattedValue, length: key.length + formattedValue.length };
  });

  // Calculate total inline length
  const totalLength = processedEntries.reduce((sum, e) => sum + e.length, 0);
  const hasLongValue = processedEntries.some(
    (e) => e.formattedValue.length > 50,
  );

  // Use inline format for simple cases: <= 3 keys and reasonable total length
  if (processedEntries.length <= 3 && totalLength < 80 && !hasLongValue) {
    const inline = processedEntries
      .map((e) => `${chalk.dim(e.key)}=${chalk.cyan(e.formattedValue)}`)
      .join(" ");
    return ` ${chalk.dim("(")}${inline}${chalk.dim(")")}`;
  }

  // Use multi-line format for complex cases
  // Account for base indentation + icon (2 chars: "ℹ ")
  const lineIndent = baseIndent + 2;
  const multiline = processedEntries
    .map((e) =>
      indent(
        `${chalk.dim(e.key)}: ${chalk.cyan(e.formattedValue)}`,
        lineIndent,
      ),
    )
    .join("\n");
  return "\n" + multiline;
}

/**
 * Formats a message with optional context for CLI output
 */
function formatMessage(
  message: string | Error,
  context?: Record<string, unknown>,
  baseIndent = 0,
): string {
  const result = message instanceof Error ? message.toString() : message;
  const contextString = formatContext(context, baseIndent);
  return `${result}${contextString}`;
}

/**
 * A {@link Logger}-compatible class that renders structured log output to
 * the terminal using chalk for colours and ora for animated spinners.
 * Context objects are automatically formatted either inline (short, flat payloads)
 * or as indented multi-line / bulleted lists (complex or array-valued payloads).
 *
 * Debug output is routed through the `debug` package under the `"versu"`
 * namespace and is only visible when the `DEBUG` environment variable includes
 * `"versu"` (e.g. `DEBUG=versu versu <command>`).
 */
export class OclifLogger implements Logger {
  private spinner: Ora | null = null;
  private groupDepth = 0;

  constructor(
    private readonly cmd: Command,
    private readonly context: Record<string, unknown> = {},
  ) {}

  /**
   * Emits a debug-level message via the `debug` package.
   * Only visible when `DEBUG=versu` (or a matching glob) is set in the environment.
   */
  debug(message: string, context?: Record<string, unknown>): void {
    const baseIndent = this.groupDepth * 2;
    debug(formatMessage(message, { ...this.context, ...context }, baseIndent));
  }

  /**
   * Helper method to handle spinner-aware logging with consistent formatting
   */
  private logWithSpinner(
    logFn: (message: string) => void,
    icon: string,
    color: (text: string) => string,
    message: string | Error,
    context?: Record<string, unknown>,
    isError = false,
  ): void {
    const baseIndent = this.groupDepth * 2;
    const formatted = formatMessage(
      message,
      { ...this.context, ...context },
      baseIndent,
    );
    const output = indent(`${color(icon)} ${formatted}`, baseIndent);

    if (this.spinner) {
      if (isError) {
        this.spinner.fail();
        this.spinner = null;
      } else {
        this.spinner.stop();
      }
    }

    logFn(output);

    if (this.spinner && !isError) {
      this.spinner.start();
    }
  }

  /** Logs an informational message with a blue `ℹ` icon. */
  info(message: string, context?: Record<string, unknown>): void {
    this.logWithSpinner(
      (msg) => this.cmd.log(msg),
      "ℹ",
      chalk.blue,
      message,
      context,
    );
  }

  /** Logs a warning with a yellow `⚠` icon via oclif's `warn`. */
  warning(message: string | Error, context?: Record<string, unknown>): void {
    this.logWithSpinner(
      (msg) => this.cmd.warn(msg),
      "⚠",
      chalk.yellow,
      message,
      context,
    );
  }

  /**
   * Logs an error with a red `✖` icon via oclif's `error`.
   * Any active spinner is failed and cleared before the message is printed.
   */
  error(message: string | Error, context?: Record<string, unknown>): void {
    this.logWithSpinner(
      (msg) => this.cmd.error(msg),
      "✖",
      chalk.red,
      message,
      context,
      true,
    );
  }

  /**
   * Returns a new `OclifLogger` that merges `context` into every subsequent
   * log call, useful for attaching a shared set of fields (e.g. a request ID)
   * to a sub-flow without polluting the parent logger.
   */
  child(context: Record<string, unknown>): Logger {
    return new OclifLogger(this.cmd, { ...this.context, ...context });
  }

  /**
   * Prints a bold cyan group header and increases the indentation depth.
   * Any active spinner is finished (succeeded) before the header is printed.
   * Pair with {@link endGroup} or prefer the auto-closing {@link group}.
   */
  startGroup(name: string): void {
    // Stop any active spinner before starting a group
    if (this.spinner) {
      this.spinner.succeed();
      this.spinner = null;
    }

    this.cmd.log(indent(chalk.bold.cyan(name), this.groupDepth));
    this.groupDepth++;
  }

  /**
   * Runs `fn` inside a named log group with an animated spinner.
   *
   * - Prints the group header via {@link startGroup}.
   * - Starts an ora spinner for the duration of `fn`.
   * - On success: marks the spinner as succeeded with "Complete".
   * - On failure: marks the spinner as failed with "Failed", then re-throws.
   * - Always calls {@link endGroup} in the `finally` block.
   */
  async group<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startGroup(name);
    try {
      // Start spinner for the group operation
      this.spinner = ora({
        indent: this.groupDepth,
        color: "cyan",
      }).start();

      const result = await fn();

      // Succeed the spinner when done
      if (this.spinner) {
        this.spinner.succeed(chalk.green("Complete"));
        this.spinner = null;
      }

      return result;
    } catch (error) {
      if (this.spinner) {
        this.spinner.fail(chalk.red("Failed"));
        this.spinner = null;
      }
      throw error;
    } finally {
      this.endGroup();
    }
  }

  /**
   * Decreases the indentation depth and cleans up any lingering spinner
   * once the depth returns to zero.
   */
  endGroup(): void {
    if (this.groupDepth > 0) {
      this.groupDepth--;
    }

    // Clean up spinner if still active
    if (this.groupDepth === 0 && this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}
