import * as path from 'path';
import * as os from 'os';

export type EnvironmentPaths = {
    data: string;
    config: string;
    cache: string;
    log: string;
    temp: string;
}

// https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
function getEnvironmentPaths(name: string): EnvironmentPaths {
    const homedir = os.homedir();
    const tmpdir = os.tmpdir();
    const username = path.basename(homedir);

    return {
        data: path.join(process.env.XDG_DATA_HOME || path.join(homedir, '.local', 'share'), name),
        config: path.join(process.env.XDG_CONFIG_HOME || path.join(homedir, '.config'), name),
        cache: path.join(process.env.XDG_CACHE_HOME || path.join(homedir, '.cache'), name),
        // https://wiki.debian.org/XDGBaseDirectorySpecification#state
        log: path.join(process.env.XDG_STATE_HOME || path.join(homedir, '.local', 'state'), name),
        temp: path.join(tmpdir, username, name),
    };
}

export const environmentPaths = getEnvironmentPaths('versu');