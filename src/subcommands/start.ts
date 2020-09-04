import fs from 'mz/fs';

import * as docker from '../utils/docker';
import { readServices, readScripts } from '../utils/config';
import { PROJECT_NAME, CHIP_LOGS_DIR } from '../utils/files';
import { log } from '../utils/log';
import { persistPid, getActiveProcesses, createLogStream } from '../utils/ps';
import { exec, execDetached } from '../utils/processes';
import { printError } from '../utils/errors';

export const startService = async (
  serviceName: string,
  run: string,
  env: { [envVar: string]: string },
  secrets: { [envVar: string]: string },
) => {
  log`Starting service {bold ${serviceName}}`;

  const { setup, setupService } = await readScripts();

  const stampFile = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;

  const out = await createLogStream(PROJECT_NAME, serviceName);
  const subprocess = execDetached(
    // Make sure stdout/stderr both get piped to `chip-log-stamper` even if the
    // `run` command fails. Also prevent stdin from being closed on the `run`
    // command, because some tools exit when they detect their stdin stream
    // has closed (such as `react-scripts start`: https://github.com/facebook/create-react-app/blob/2da5517689b7510ff8d8b0148ce372782cb285d7/packages/react-scripts/scripts/start.js#L156-L161).
    `
    function setup_and_run {
      ${setup}
      ${setupService}
      tail -f /dev/null | ${run}
    }
    (setup_and_run || true) 2>&1 | chip-log-stamper ${stampFile}
    `,
    { cwd: serviceName, out, env: { ...process.env, ...env, ...secrets } },
  );

  await persistPid(PROJECT_NAME, serviceName, subprocess.pid);
};

export const startServices = async (serviceWhitelist?: string[]) => {
  // if (await fs.exists(`./docker-compose.yml`)) {
  // await exec(`docker-compose up -d`, { cwd: '.', live: true });
  // }

  if (docker.isPresent()) {
    // TODO: Filter `serviceWhitelist` for docker services
    // If no whitelist is passed, all docker services will be started
    await docker.up();
  }

  const services = await readServices(serviceWhitelist);
  const activeProcesses = await getActiveProcesses(PROJECT_NAME);

  for (const { name, run, env, secrets } of services) {
    if (!run) continue;
    try {
      if (activeProcesses[name]) {
        log`Already running service {bold ${name}}`;
      } else {
        await startService(name, run, env, secrets);
      }
    } catch (e) {
      printError(e);
    }
  }
};
