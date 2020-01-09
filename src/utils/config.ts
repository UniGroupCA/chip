import fs from 'mz/fs';
import yaml from 'js-yaml';

export interface ChipConfig {
  services: {
    [name: string]: { repo: string; install?: string; run?: string };
  };
}

export const readConfig = async (): Promise<ChipConfig> => {
  const chipYml = await fs.readFile('./chip.yml', 'utf8');
  const chipConfig = await yaml.safeLoad(chipYml);
  return chipConfig;
};

export const readServices = async () => {
  const { services } = await readConfig();
  return Object.entries(services).map(([name, values]) => ({
    name,
    ...values,
  }));
};
