import fs from 'mz/fs';
import yaml from 'js-yaml';
import { readJsonFile, CHIP_PROCESSES_FILE } from './files';

export interface ChipConfig {
  setup?: string;
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

export const readConfig = async (): Promise<ChipConfig> => {
  const chipYml = await fs.readFile('./chip.yml', 'utf8');
  const chipConfig = await yaml.safeLoad(chipYml);
  return chipConfig;
};

export const readSetup = async (): Promise<string> => {
  const { setup } = await readConfig();
  return setup || '';
};

export const readServices = async (): Promise<{
  name: string;
  repo?: string;
  install?: string;
  run?: string;
}[]> => {
  const { services = {} } = await readConfig();
  return Object.entries(services).map(([name, values]) => ({
    name,
    ...values,
  }));
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
