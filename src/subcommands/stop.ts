import chalk from 'chalk';

import * as docker from '../utils/docker';
import { exec } from '../utils/processes';
import { processExists, getActiveProcesses } from '../utils/ps';
import { PROJECT_NAME } from '../utils/files';
import { printError } from '../utils/errors';

export const stopProcess = async (name: string, pid: number) => {
  console.log(chalk`Stopping {bold ${name}} with pid {bold ${pid}}`);
  if (await processExists(pid)) {
    // https://stackoverflow.com/a/8406413
    await exec(`kill -SIGINT -${pid}`);

    // TODO: Add a `chip stop --force` flag that uses `-TERM` signal:
    // execSync(`kill -TERM -${pid}`);
  } else {
    console.log(chalk`Unknown process with pid {bold ${pid}}`);
  }
};

export const stopServices = async (serviceWhitelist: string[]) => {
  const processes = await getActiveProcesses(PROJECT_NAME);

  const filteredProcesses = Object.entries(processes).filter(
    ([name]) =>
      serviceWhitelist.length === 0 || serviceWhitelist.includes(name),
  );

  for (const [name, { pid }] of filteredProcesses) {
    try {
      await stopProcess(name, pid);
    } catch (e) {
      printError(e);
    }
  }

  if (docker.isPresent()) {
    if (serviceWhitelist.length === 0) {
      await docker.stop();
    } else {
      const dockerServices = await docker.composeServiceNames(serviceWhitelist);
      if (dockerServices.length > 0) await docker.stop(dockerServices);
    }
  }
};
