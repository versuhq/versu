import * as core from "@actions/core";
import type { Logger } from "@versu/core";

function formatMessage(
  message: string | Error,
  context?: Record<string, unknown>,
): string {
  const result = message instanceof Error ? message.toString() : message;
  const contextString = context && Object.keys(context).length > 0 
    ? ` ${JSON.stringify(context, null, 0)}` 
    : "";
  return `${result}${contextString}`;
}

export class ActionsLogger implements Logger {
  private readonly context: Record<string, unknown>;

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
  child(context: Record<string, unknown>): Logger {
    return new ActionsLogger({ ...this.context, ...context });
  }
  group<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return core.group(name, fn);
  }
  startGroup(name: string): void {
    core.startGroup(name);
  }
  endGroup(): void {
    core.endGroup();
  }
}
