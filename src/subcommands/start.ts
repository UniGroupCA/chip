import fs from 'mz/fs';
import { readServices, readScripts } from '../utils/config';
import { PROJECT_NAME, CHIP_LOGS_DIR } from '../utils/files';
import { log } from '../utils/log';
import { persistPid, getActiveProcesses, createLogStream } from '../utils/ps';
import { exec, execDetached } from '../utils/processes';

// TODO: Include process timestamp in identifier to avoid PID conflicts across reboots
// TODO: Monitor detached processes to determine if they succesfully started or not
// TODO: Only start if it's not already running
export const startService = async (serviceName: string, run: string) => {
  log`Starting service {bold ${serviceName}}`;

  const { setup, setupService } = await readScripts();

  const stampFile = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;

  const out = await createLogStream(PROJECT_NAME, serviceName);
  const subprocess = execDetached(
    // Make sure stdout/stderr both get piped to `chip-log-stamper` even if the
    // `run` command fails.
    `
    function setup_and_run {
      ${setup}
      ${setupService}
      ${run}
    }
    (setup_and_run || true) 2>&1 | chip-log-stamper ${stampFile}
    `,
    { cwd: serviceName, out },
  );

  await persistPid(PROJECT_NAME, serviceName, subprocess.pid);
};

export const startServices = async (serviceWhitelist?: string[]) => {
  if (await fs.exists(`./docker-compose.yml`)) {
    await exec(`docker-compose up -d`, { cwd: '.', live: true });
  }

  const services = await readServices(serviceWhitelist);
  const activeProcesses = await getActiveProcesses(PROJECT_NAME);

  for (const { name, run } of services) {
    if (!run) continue;
    try {
      if (activeProcesses[name]) {
        log`Already running service {bold ${name}}`;
      } else {
        await startService(name, run);
      }
    } catch (e) {
      console.error(e);
    }
  }
};
