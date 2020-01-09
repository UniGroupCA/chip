import { readServices } from '../utils/config';
import { exec } from '../utils/processes';

export const installService = async (name: string, install: string) => {
  await exec(install, { cwd: name, live: true });
};

export const installServices = async () => {
  const services = await readServices();

  for (const { name, install } of services) {
    if (!install) continue;
    try {
      await installService(name, install);
    } catch (e) {
      console.error(e);
    }
  }
};
