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
          env?: { [envVar: string]: string };
        }
      | undefined;
  };
}

export interface ChipSecrets {
  services?: {
    [envVar: string]: string;
  };
}

export const readConfig = async (): Promise<ChipConfig> => {
  const chipYml = await fs.readFile('./chip.yml', 'utf8');
  const chipConfig = await yaml.safeLoad(chipYml);
  return chipConfig;
};

export const readSecrets = async (): Promise<ChipSecrets> => {
  try {
    const secretYml = await fs.readFile('./secretchip.yml', 'utf8');
    const secretConfig = await yaml.safeLoad(secretYml);
    return secretConfig;
  } catch (e) {
    if (e.code === 'ENOENT') return {};
    else throw e;
  }
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
  env: { [envVar: string]: string };
  secrets: { [name: string]: string };
}[]> => {
  const config = await readConfig();
  const secrets = await readSecrets();

  const allServices = Object.entries(config.services ?? {}).map(
    ([name, values]) => ({
      ...values,
      name,
      env: values?.env ?? {},
      secrets: secrets.services?.[name] ?? {},
    }),
  );

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
