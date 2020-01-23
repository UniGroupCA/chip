import { readServices, readScripts } from '../utils/config';
import { exec } from '../utils/processes';
import { log } from '../utils/log';
import { printError } from '../utils/errors';

export const installService = async (name: string, install: string) => {
  log`Installing dependencies for {bold ${name}}`;

  const { setup, setupService } = await readScripts();

  await exec(
    `
    ${setup}
    ${setupService}
    ${install}
    `,
    { cwd: name, live: true },
  );
};

export const installServices = async (serviceWhitelist?: string[]) => {
  const services = await readServices(serviceWhitelist);

  log`Executing {bold preinstall} script`;
  const scripts = await readScripts();

  await exec(
    `
    ${scripts.setup}
    ${scripts.install}
    `,
    { cwd: '.', live: true },
  );

  for (const { name, install } of services) {
    if (!install) continue;
    try {
      await installService(name, install);
    } catch (e) {
      printError(e);
    }
  }
};
