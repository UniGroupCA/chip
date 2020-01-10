import { spawn } from 'child_process';
import { readServices } from '../utils/config';
import { PROJECT_NAME } from '../utils/files';
import { log } from '../utils/log';
import { persistPid, getActiveProcesses } from '../utils/ps';

// TODO: Include process timestamp in identifier to avoid PID conflicts across reboots
// TODO: Monitor detached processes to determine if they succesfully started or not
// TODO: Only start if it's not already running
export const startService = async (serviceName: string, run: string) => {
  log`Starting {bold ${serviceName}}`;

  // const out = await createLogStream(projectName, serviceName);

  const subprocess = spawn('bash', ['-c', run], {
    cwd: serviceName,
    // stdio: ['ignore', out, out],
    stdio: 'inherit',
    detached: true,
  });

  await persistPid(PROJECT_NAME, serviceName, subprocess.pid);

  subprocess.unref();
};

export const startServices = async () => {
  // if (await fs.exists(`./docker-compose.yml`)) {
  //   execSync(`docker-compose up -d`, { cwd: '.', stdio: 'inherit' });
  // }

  const services = await readServices();
  const activeProcesses = await getActiveProcesses(PROJECT_NAME);

  for (const { name, run } of services) {
    if (!run) continue;
    try {
      if (activeProcesses[name]) {
        log`Already running service {bold ${name}}`;
      } else {
        log`Starting service {bold ${name}}`;
        await startService(name, run);
      }
    } catch (e) {
      console.error(e);
    }
  }
};
