import chalk from 'chalk';
import { execSync } from 'child_process';
import { processExists, getActiveProcesses } from '../utils/ps';
import { PROJECT_NAME } from '../utils/files';

export const stopProcess = async (name: string, pid: number) => {
  console.log(chalk`Stopping {bold ${name}} with pid {bold ${pid}}`);
  if (await processExists(pid)) {
    // https://stackoverflow.com/a/8406413
    execSync(`kill -TERM -${pid}`);
  } else {
    console.log(chalk`Unknown process with pid {bold ${pid}}`);
  }
};

// const stopProcessForce = async (name, pid) => {
//   console.log(
//     chalk`{red Force} stopping {bold ${name}} with pid {bold ${pid}}`,
//   );
//   if (await processExists(pid)) {
//     // https://stackoverflow.com/a/8406413
//     execSync(`kill -KILL -${pid}`);
//   } else {
//     console.log(chalk`Unknown process with pid {bold ${pid}}`);
//   }
// };

export const stopServices = async () => {
  const processes = await getActiveProcesses(PROJECT_NAME);

  for (const [name, { pid }] of Object.entries(processes)) {
    await stopProcess(name, pid);
  }
};
