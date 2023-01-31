import { execSync } from 'child_process';
import lodash from 'lodash';
import { userInfo } from 'os';
import stripAnsi from 'strip-ansi';
import { Platforms } from '../enums';

export const ENV_PATH_KEY = 'PATH';

const defaultShell = () => {
  const { env, platform } = process;
  if (platform === Platforms.Win) {
    return env.COMSPEC ?? 'cmd.exe';
  }
  try {
    const { shell } = userInfo();
    if (shell !== undefined) {
      return shell;
    }
  } catch {}
  if (platform === Platforms.MacOS) {
    return env.SHELL ?? '/bin/zsh';
  }
  return env.SHELL ?? '/bin/sh';
};

const arguments_ = [
  '-ilc',
  '\'echo -n "_SHELL_ENV_DELIMITER_"; env; echo -n "_SHELL_ENV_DELIMITER_"; exit\'',
];

const environment = {
  // Disables Oh My Zsh auto-update thing that can block the process.
  DISABLE_AUTO_UPDATE: 'true',
};

const parseEnvironment = (environment_: string): Record<string, string> => {
  const environment = lodash.cloneDeep(environment_);
  const environmentArr = environment.split('_SHELL_ENV_DELIMITER_')[1];
  const returnValue: Record<string, string> = {};

  for (const line of stripAnsi(environmentArr)
    .split('\n')
    .filter((line) => Boolean(line))) {
    const [key, ...values] = line.split('=');
    returnValue[key] = values.join('=');
  }

  return returnValue;
};

function shellEnvironmentSync(shell?: string): NodeJS.ProcessEnv {
  if (process.platform === Platforms.Win) {
    return process.env;
  }
  try {
    const stdout = execSync(`${shell ?? defaultShell()} ${arguments_.join(' ')}`, {
      env: environment,
    });
    return parseEnvironment(stdout.toString('utf8').trim());
  } catch (error) {
    if (shell !== undefined) {
      throw error;
    } else {
      return process.env;
    }
  }
}

function shellPathSync(): string | undefined {
  const { PATH } = shellEnvironmentSync();
  return PATH;
}

export function fixPathUtil(): void {
  if (process.platform === Platforms.Win) {
    return;
  }

  process.env[ENV_PATH_KEY] =
    shellPathSync() ??
    [
      './node_modules/.bin',
      '/.nodebrew/current/bin',
      '/usr/local/bin',
      '/usr/local/go/bin',
      process.env[ENV_PATH_KEY],
    ].join(':');
}
