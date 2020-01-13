import chalk from 'chalk';
import { Tail } from 'tail';

import { getAllProcesses } from '../utils/ps';
import { CHIP_LOGS_DIR, PROJECT_NAME } from '../utils/files';

const getProcessTail = async (projectName: string, serviceName: string) => {
  const fileName = `${CHIP_LOGS_DIR}/${projectName}/${serviceName}.log`;
  return new Tail(fileName);
};

export const logService = async (projectName: string, serviceName: string) => {
  const tail = await getProcessTail(projectName, serviceName);

  tail.on('line', (data: any) => {
    const servicePrefix = chalk`{bold ${serviceName} | }`;
    console.log(servicePrefix + data);
  });

  tail.on('error', (error: any) => {
    console.error(
      chalk`{red Error tailing logs for {bold ${serviceName}}: ${error}}`,
    );
  });
};

export const logServices = async () => {
  const processes = (await getAllProcesses(PROJECT_NAME)) || {};

  for (const [name] of Object.entries(processes)) {
    logService(PROJECT_NAME, name);
  }
};
