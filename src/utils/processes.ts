import { spawn } from 'child_process';

export interface ExecOptions {
  cwd?: string;
  live?: boolean;
}

export const exec = (
  command: string,
  { cwd, live }: ExecOptions = {},
): Promise<string> => {
  const child = spawn('bash', ['-c', command], { cwd });

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
