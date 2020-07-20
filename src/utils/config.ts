import process from 'process';
import fs from 'mz/fs';
import yaml from 'js-yaml';
import { readJsonFile, CHIP_PROCESSES_FILE } from './files';

export interface ChipConfig {
  setup?: string;
  install?: string;
  'setup-service'?: string;
  services?: {
    [name: string]:
      | {
          repo?: string;
          install?: string;
          run?: string;
        }
      | undefined;
  };
}

const readChipYml = async (): Promise<string> => {
  while (true) {
    try {
      return await fs.readFile('./chip.yml', 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT' && process.cwd() !== '/') {
        process.chdir('../');
      } else {
        throw err;
      }
    }
  }
};

export const readConfig = async (): Promise<ChipConfig> => {
  const chipYml = await readChipYml();
  const chipConfig = await yaml.safeLoad(chipYml);
  return chipConfig;
};

export const readScripts = async () => {
  const config = await readConfig();
  return {
    setup: config.setup || '',
    install: config.install || '',
    setupService: config['setup-service'] || '',
  };
};

export const readServices = async (
  whitelist: string[] = [],
): Promise<{
  name: string;
  repo?: string;
  install?: string;
  run?: string;
}[]> => {
  const { services = {} } = await readConfig();
  const allServices = Object.entries(services).map(([name, values]) => ({
    name,
    ...values,
  }));
  return whitelist.length > 0
    ? allServices.filter((service) => whitelist.includes(service.name))
    : allServices;
};

export interface Processes {
  [projectName: string]:
    | {
        [serviceName: string]: { pid: number } | undefined;
      }
    | undefined;
}

export const readProcesses = async (): Promise<Processes> =>
  readJsonFile(CHIP_PROCESSES_FILE);
