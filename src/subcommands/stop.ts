import chalk from 'chalk';
import fs from 'mz/fs';

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

export const stopServices = async (serviceWhitelist: string[] = []) => {
  const processes = await getActiveProcesses(PROJECT_NAME);

  const filteredProcesses = Object.entries(processes).filter(
    ([name]) => serviceWhitelist.length == 0 || serviceWhitelist.includes(name),
  );

  for (const [name, { pid }] of filteredProcesses) {
    try {
      await stopProcess(name, pid);
    } catch (e) {
      printError(e);
    }
  }

  try {
    if (docker.isPresent()) {
      // TODO: Filter `serviceWhitelist` for docker services
      // If no whitelist is passed, all docker services will be stopped
      // Also support `chip stop --remove` cli flag to call `docker.rm()`
      await docker.stop();
    }
    // if (
    //   serviceWhitelist.length === 0 &&
    //   (await fs.exists(`./docker-compose.yml`))
    // ) {
    //   await exec(`docker-compose stop`, { cwd: '.', live: true });
    // }
  } catch (e) {
    printError(e);
  }
};
