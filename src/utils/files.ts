import fs from 'mz/fs';
import { basename, resolve } from 'path';

export const CWD = resolve('.');

export const PROJECT_NAME = basename(CWD);

export const fileExists = async (path: string) => {
  try {
    await fs.stat(path);
    return true;
  } catch (e) {
    if (e.code === 'ENOENT') return false;
    throw e;
  }
};
