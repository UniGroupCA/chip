import fs from 'mz/fs';
import { exec } from './processes';
import { CHIP_DIR, CHIP_PROCESSES_FILE, writeJsonFile } from './files';
import { readProcesses } from './config';

export const initChip = async () => {
  if (!(await fs.exists(CHIP_DIR))) await fs.mkdir(CHIP_DIR);

  if (!(await fs.exists(CHIP_PROCESSES_FILE))) {
    writeJsonFile(CHIP_PROCESSES_FILE, {});
  }
};

export const processExists = async (pid: number) => {
  try {
    await exec(`ps ${pid}`);
    return true;
  } catch (e) {
    return false;
  }
};

export const persistPid = async (
  projectName: string,
  serviceName: string,
  pid: number,
) => {
  const processes = await readProcesses();
  if (!processes[projectName]) processes[projectName] = {};
  processes[projectName]![serviceName] = { pid };
  await writeJsonFile(CHIP_PROCESSES_FILE, processes);
};

export const getAllProcesses = async (projectName: string) => {
  const processes = await readProcesses();
  if (!processes[projectName]) processes[projectName] = {};
  return processes[projectName];
};

export const getActiveProcesses = async (projectName: string) => {
  const activeProcesses: { [name: string]: { pid: number } } = {};
  const processes = (await getAllProcesses(projectName)) || {};
  for (const [name, config] of Object.entries(processes)) {
    if (await processExists(config!.pid)) activeProcesses[name] = config!;
  }
  return activeProcesses;
};
