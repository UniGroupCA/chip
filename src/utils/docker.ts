import fs from 'mz/fs';
import yaml from 'js-yaml';
import { resolve } from 'path';
import { green, red } from 'chalk';

import { CWD } from '../utils/files';
import { exec } from '../utils/processes';

const capitalize = (value: string) =>
  value.substring(0, 1).toUpperCase() + value.substring(1);

const run = (cmd: string) => exec(cmd, { cwd: '.', live: false });

const parseTable = (rawTable: string, skipRows = 0) =>
  rawTable
    .split('\n')
    .slice(skipRows)
    .filter(Boolean)
    .map((line) => line.split(/\s{3,}/g));

/** Returns `true` if a `docker-compose.yml` file is present in the project */
export const isPresent = () => fs.existsSync(`${CWD}/docker-compose.yml`);

export const composeServices = async (): Promise<{
  [serviceName: string]: { image: string };
}> => {
  const composeYml = await fs.readFile(`${CWD}/docker-compose.yml`, 'utf8');
  const composeConfig = await yaml.safeLoad(composeYml);
  return composeConfig?.services ?? {};
};

/** Returns a list of all services in the `docker-compose.yml` file */
export const listServices = async () => {
  const services = await composeServices();

  const allRunningServicesTable = await run(
    `docker ps --format '{{.Label "com.docker.compose.project.working_dir"}}   {{.Label "com.docker.compose.service"}}   {{.Status}}'`,
  );

  const runningServices = parseTable(allRunningServicesTable)
    .map(([projectDir, serviceName, status]) => ({
      projectDir,
      serviceName,
      status,
    }))
    .filter(({ projectDir }) => resolve(projectDir) === CWD);

  return Object.entries(services).map(([serviceName, { image }]) => {
    const info = runningServices.find((s) => s.serviceName === serviceName);
    return {
      name: serviceName,
      image,
      status: info?.status ? green(capitalize(info.status)) : red('Stopped'),
    };
  });
};
