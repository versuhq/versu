import * as github from "@actions/github";
import { Context } from "@actions/github/lib/context";

const prEvents = [
  "pull_request",
  "pull_request_target",
  "pull_request_review",
  "pull_request_review_comment",
];
const REFS_REGEX = RegExp("refs/(heads|tags)/");

export interface ExtendedContext extends Context {
  isPullRequest(): this is PullRequestContext;
  getSha(): string;
  getCurrentBranchName(): string;
  getCurrentCommitId(short: boolean): string;
  getLinkToFile(filePath: string, line?: number): string;
}

export interface PullRequestContext extends ExtendedContext {
  getPullRequestInformation(): {
    headSha: string;
    baseSha: string;
    number: number;
  };
}

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

export const githubContext: ExtendedContext = extendContext(github.context);
