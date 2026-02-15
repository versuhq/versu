import { Command } from "@oclif/core";
import type { Logger } from "@versu/core";
import Debug from "debug";
import chalk from "chalk";
import ora, { Ora } from "ora";

const debug = Debug("versu");

function indent(str: string, spaces: number): string {
  const indentation = " ".repeat(spaces);
  return indentation + str;
}

/**
 * Formats context object for beautiful CLI display
 */
function formatContext(context?: Record<string, unknown>, baseIndent = 0): string {
  if (!context || Object.keys(context).length === 0) return "";

  // Base indent for context lines (accounts for group depth + icon "ℹ ")
  const linePrefix = " ".repeat(baseIndent + 2);

  const entries = Object.entries(context)
    .map(([key, value]) => {
      let formattedValue: string;
      
      if (typeof value === "object" && value !== null) {
        const jsonStr = JSON.stringify(value, null, 2);
        const lines = jsonStr.split("\n");
        
        // First line stays on same line as key, subsequent lines get base indent only
        formattedValue = lines
          .map((line, i) => {
            if (i === 0) return line;
            // Just add linePrefix - JSON.stringify already has proper indentation
            return linePrefix + line;
          })
          .join("\n");
      } else {
        formattedValue = String(value);
      }
      
      return `${linePrefix}${chalk.dim(key)}: ${chalk.white(formattedValue)}`;
    })
    .join("\n");

  return "\n" + entries;
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
 * CLI Logger implementation with beautiful formatting using chalk and ora
 * Implements the core Logger interface for presentation in the CLI
 */
export class OclifLogger implements Logger {
  private spinner: Ora | null = null;
  private groupDepth = 0;
  private verbose: boolean;

  constructor(
    private readonly cmd: Command,
    private readonly context: Record<string, unknown> = {},
    verbose = false,
  ) {
    this.verbose = verbose;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    // Debug messages only shown in verbose mode
    if (this.verbose) {
      const baseIndent = this.groupDepth * 2;
      debug(formatMessage(message, { ...this.context, ...context }, baseIndent));
    }
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
    const formatted = formatMessage(message, { ...this.context, ...context }, baseIndent);
    const output = indent(color(icon) + " " + formatted, baseIndent);
    
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

  info(message: string, context?: Record<string, unknown>): void {
    this.logWithSpinner(
      (msg) => this.cmd.log(msg),
      "ℹ",
      chalk.blue,
      message,
      context,
    );
  }

  warning(message: string | Error, context?: Record<string, unknown>): void {
    this.logWithSpinner(
      (msg) => this.cmd.warn(msg),
      "⚠",
      chalk.yellow,
      message,
      context,
    );
  }

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

  child(context: Record<string, unknown>): Logger {
    return new OclifLogger(this.cmd, { ...this.context, ...context }, this.verbose);
  }

  startGroup(name: string): void {
    // Stop any active spinner before starting a group
    if (this.spinner) {
      this.spinner.succeed();
      this.spinner = null;
    }
    
    this.cmd.log(indent(chalk.bold.cyan(name), this.groupDepth));
    this.groupDepth++;
  }

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
