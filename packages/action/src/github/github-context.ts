import * as github from "@actions/github";
import { Context } from "@actions/github/lib/context";

/** GitHub event names that represent pull request activity. */
const prEvents = [
  "pull_request",
  "pull_request_target",
  "pull_request_review",
  "pull_request_review_comment",
];

/** Matches the `refs/heads/` or `refs/tags/` prefix in a Git ref string. */
const REFS_REGEX = RegExp("refs/(heads|tags)/");

/**
 * Extends the standard GitHub Actions {@link Context} with convenience methods
 * for common operations like resolving the current SHA, branch name, commit ID,
 * and generating permalink URLs to files.
 */
export interface ExtendedContext extends Context {
  /** Returns `true` and narrows the type to {@link PullRequestContext} when the
   *  triggering event is a pull request event. */
  isPullRequest(): this is PullRequestContext;
  /** Returns the most relevant SHA for the event — uses the PR head SHA when
   *  running in a pull request context, otherwise falls back to `context.sha`. */
  getSha(): string;
  /** Returns the current branch or tag name with the `refs/heads/` / `refs/tags/`
   *  prefix stripped. */
  getCurrentBranchName(): string;
  /** Returns the triggering commit SHA. Pass `short: true` to get a 7-character
   *  abbreviated SHA. */
  getCurrentCommitId(short: boolean): string;
  /** Builds a permalink to a file in the repository at the current commit.
   *  Optionally anchors to a specific `line` number. */
  getLinkToFile(filePath: string, line?: number): string;
}

/**
 * Narrows {@link ExtendedContext} for pull request events, adding a method to
 * retrieve PR-specific metadata from the event payload.
 */
export interface PullRequestContext extends ExtendedContext {
  /** Returns the head SHA, base SHA, and PR number from the event payload.
   *  Throws if the pull request payload is absent. */
  getPullRequestInformation(): {
    headSha: string;
    baseSha: string;
    number: number;
  };
}

/**
 * Augments a GitHub Actions {@link Context} object with the methods defined by
 * {@link ExtendedContext} (and {@link PullRequestContext} when applicable).
 *
 * The function mutates the passed-in context via property assignment rather
 * than subclassing, so the original reference is also updated.
 *
 * @param context - The raw GitHub Actions context to extend.
 * @returns The same object cast to {@link ExtendedContext}.
 */
export function extendContext(context: Context): ExtendedContext {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions,@typescript-eslint/no-explicit-any
  const result = <any>context;

  const isPR = (): boolean => prEvents.includes(context.eventName);

  result.isPullRequest = () => isPR();

  if (isPR()) {
    result.getPullRequestInformation = () => {
      const pull = context.payload.pull_request;
      if (!pull) {
        throw new Error(
          "Pull request information is not available in the context payload",
        );
      }
      return {
        headSha: pull.head.sha,
        baseSha: pull.base.sha,
        number: pull.number,
      };
    };
  }

  result.getSha = () => {
    let sha = context.sha;
    if (result.isPullRequest()) {
      const pull = context.payload.pull_request;
      if (pull?.head.sha) {
        sha = pull?.head.sha;
      }
    }

    return sha;
  };

  result.getCurrentBranchName = () => context.ref.replace(REFS_REGEX, "");

  result.getCurrentCommitId = (short: boolean) => {
    let commitId = context.sha;
    if (short) commitId = commitId.substring(0, 7);
    return commitId;
  };

  result.getLinkToFile = (filePath: string, line?: number): string => {
    const link = `${context.serverUrl}/${context.repo.owner}/${
      context.repo.repo
    }/blob/${result.getCurrentCommitId(false)}/${filePath}`;
    return line !== undefined ? `${link}#L${line}` : link;
  };

  return result;
}

/** Pre-built {@link ExtendedContext} instance wrapping the current GitHub Actions run context. */
export const githubContext: ExtendedContext = extendContext(github.context);
