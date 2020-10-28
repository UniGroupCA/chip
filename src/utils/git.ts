import { exec } from './processes';

export const activeBranch = async (cwd: string) => {
  const output = await exec('git branch', { cwd });
  if (output.trim() === '') return '';
  const targetLine = output.split('\n').find((line) => line.includes('*'));
  if (!targetLine) throw new Error('Failed to parse `git branch` output');
  return targetLine.substring(2);
};

export const branchExistsOnRemote = async (cwd: string, branch: string) => {
  try {
    await exec(`git show-branch 'remotes/origin/${branch}'`, { cwd });
    return true;
  } catch {
    return false;
  }
};

const pull = (cwd: string) => exec('git pull', { cwd, live: true });

export const clone = (cwd: string, repo: string, dest = '') =>
  exec(`git clone ${repo} ${dest}`, { cwd, live: true });

export const checkout = (cwd: string, branch: string) =>
  exec(`git checkout ${branch}`, { cwd, live: true });

export const status = (cwd: string) => exec(`git status`, { cwd, live: true });

export const safePull = async (cwd: string) => {
  const branch = await activeBranch(cwd);
  if (await branchExistsOnRemote(cwd, branch)) await pull(cwd);
};
