import { spawn, ChildProcess } from 'child_process';

export interface ExecOptions {
  cwd?: string;
  live?: boolean;
  env?: NodeJS.ProcessEnv;
}

export const exec = (
  command: string,
  { cwd, live, env }: ExecOptions = {},
): Promise<string> => {
  const child = spawn('bash', ['-c', command], { cwd, env });

  if (live) {
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  }

  let output = '';
  child.stdout.on('data', (data) => {
    output += data;
  });
  child.stderr.on('data', (data) => {
    output += data;
  });

  return new Promise((resolve, reject) => {
    child.on('error', (err) => reject({ err, output }));
    child.on('exit', (code) => {
      if (code !== 0) reject({ code, output });
      else resolve(output);
    });
  });
};

export interface SpawnOptions {
  cwd?: string;
  out?: number;
  env?: NodeJS.ProcessEnv;
}

export const execDetached = (
  command: string,
  { cwd, out, env }: SpawnOptions = {},
): ChildProcess => {
  const subprocess = spawn('bash', ['-c', command], {
    cwd,
    env,
    stdio: out ? ['ignore', out, out] : 'inherit',
    detached: true,
  });

  subprocess.unref();

  return subprocess;
};
