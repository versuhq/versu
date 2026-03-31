import * as core from '@actions/core';
import { VersuRunner, RunnerOptions, initLogger, logger } from '@versu/core';
import { ActionsLogger } from './logger.js';
import { parseBooleanInput } from './utils/actions.js';
import { VERSION, PACKAGE_NAME } from './version.js';
import { githubContext } from './github/github-context.js';

/**
 * Main entry point for Versu GitHub Action
 */
export async function run(): Promise<void> {
  try {
    initLogger(new ActionsLogger());
    
    logger.info("Starting action", { package: PACKAGE_NAME, version: VERSION });
    
    // Get repository root (GitHub Actions sets GITHUB_WORKSPACE)
    const repoRoot = process.env.GITHUB_WORKSPACE || process.cwd();
    
    // Get inputs
    const dryRun = parseBooleanInput(core.getInput('dry-run'));
    const adapter = core.getInput('adapter') || undefined;
    const createTags = parseBooleanInput(core.getInput('create-tags'));
    const prereleaseMode = parseBooleanInput(core.getInput('prerelease-mode'));
    const prereleaseId = core.getInput('prerelease-id') || 'alpha';
    const bumpUnchanged = parseBooleanInput(core.getInput('bump-unchanged'));
    const addBuildMetadata = parseBooleanInput(core.getInput('add-build-metadata'));
    const timestampVersions = parseBooleanInput(core.getInput('timestamp-versions'));
    const appendSnapshot = parseBooleanInput(core.getInput('append-snapshot'));
    const pushChanges = parseBooleanInput(core.getInput('push-changes'));
    const generateChangelog = parseBooleanInput(core.getInput('generate-changelog') || 'false');
    const generateReleaseNotes = parseBooleanInput(core.getInput('generate-release-notes') || 'false');
    const changelogFilename = core.getInput('changelog-filename') || 'CHANGELOG.md';
    const releaseNotesFilename = core.getInput('release-notes-filename') || 'RELEASE.md';

    let fromRef: string | undefined;
    if (githubContext.isPullRequest()) {
      const {baseSha} = githubContext.getPullRequestInformation();
      fromRef = baseSha;
    }

    // Create runner options
    const options: RunnerOptions = {
      repoRoot,
      prereleaseMode,
      prereleaseId,
      bumpUnchanged,
      addBuildMetadata,
      timestampVersions,
      appendSnapshot,
      createTags,
      generateChangelog,
      generateReleaseNotes,
      pushChanges,
      dryRun,
      adapter,
      changelogFilename,
      releaseNotesFilename,
      fromRef,
      provider: 'github',
    };
    
    // Run Versu engine
    const runner = new VersuRunner(options);
    const result = await runner.run();

    // Set outputs
    core.setOutput('bumped', result.bumped.toString());
    core.setOutput('discovered-modules', JSON.stringify(result.discoveredModules));
    core.setOutput('changed-modules', JSON.stringify(result.changedModules));
    core.setOutput('created-tags', result.createdTags.join(','));
    core.setOutput('changelog-paths', result.changelogPaths.join(','));
    core.setOutput('release-notes-paths', result.releaseNotesPaths.join(','));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Action failed: ${errorMessage}`);
    
    if (error instanceof Error && error.stack) {
      logger.debug("Stack trace", { stack: error.stack });
    }
  }
}
