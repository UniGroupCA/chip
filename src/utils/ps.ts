import fs from 'mz/fs';
import { exec } from './processes';
import {
  CHIP_DIR,
  CHIP_PROCESSES_FILE,
  writeJsonFile,
  CHIP_LOGS_DIR,
  CWD,
} from './files';
import { readProcesses, ProcessRecord } from './config';
import { printError } from './errors';

export const initChip = async () => {
  if (!(await fs.exists(CHIP_DIR))) await fs.mkdir(CHIP_DIR);
  if (!(await fs.exists(CHIP_LOGS_DIR))) await fs.mkdir(CHIP_LOGS_DIR);

  if (!(await fs.exists(CHIP_PROCESSES_FILE))) {
    writeJsonFile(CHIP_PROCESSES_FILE, {});
  }

  if (!(await fs.exists('./chip.yml'))) {
    printError({ message: `No chip.yml file found in ${CWD}` });
    process.exit(1);
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

/**
 * Returns the process start time as unix timestamp. Throws an error if no
 * process with the given `pid` exists
 */
export const lookupStartTime = async (pid: number) => {
  try {
    // Sample output: `Wed Sep  2 11:17:24 2020`
    const startDate = await exec(`ps -p ${pid} -o lstart=`);
    return new Date(startDate).getTime();
  } catch (e) {
    if (e.message) {
      e.message = `Failed to get start start time for pid ${pid}: ${e.message}`;
    }
    throw e;
  }
};

export const persistPid = async (
  projectName: string,
  serviceName: string,
  pid: number,
) => {
  const startTime = await lookupStartTime(pid);
  const processes = await readProcesses();
  if (!processes[projectName]) processes[projectName] = {};
  processes[projectName]![serviceName] = { pid, startTime };
  await writeJsonFile(CHIP_PROCESSES_FILE, processes);
};

export const getAllProcesses = async (projectName: string) => {
  const processes = await readProcesses();
  if (!processes[projectName]) processes[projectName] = {};
  return processes[projectName];
};

export const getActiveProcesses = async (projectName: string) => {
  const activeProcesses: { [name: string]: ProcessRecord } = {};
  const processes = (await getAllProcesses(projectName)) || {};
  for (const [name, config] of Object.entries(processes)) {
    const { pid, startTime } = config!;
    if (await processExists(pid)) {
      if (startTime) {
        const currentStartTime = await lookupStartTime(pid);
        if (currentStartTime === startTime) activeProcesses[name] = config!;
      } else {
        // Handle missing `startTime` for backwards compatibility
        activeProcesses[name] = config!;
      }
    }
  }
  return activeProcesses;
};

export const createLogStream = async (
  projectName: string,
  serviceName: string,
) => {
  const dir = `${CHIP_LOGS_DIR}/${projectName}`;
  if (!(await fs.exists(dir))) await fs.mkdir(dir);
  return fs.open(`${dir}/${serviceName}.log`, 'w');
};
