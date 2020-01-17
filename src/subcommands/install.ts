import { readServices, readScripts } from '../utils/config';
import { exec } from '../utils/processes';
import { log } from '../utils/log';

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

export const installServices = async () => {
  const services = await readServices();

  log`Executing {bold preinstall} script`;
  const { setup, install } = await readScripts();

  await exec(
    `
    ${setup}
    ${install}
    `,
    { cwd: '.', live: true },
  );

  for (const { name, install } of services) {
    if (!install) continue;
    try {
      await installService(name, install);
    } catch (e) {
      console.error(e);
    }
  }
};
