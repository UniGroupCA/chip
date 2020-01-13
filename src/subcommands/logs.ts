import chalk from 'chalk';
import { Tail } from 'tail';

import { getAllProcesses } from '../utils/ps';
import { CHIP_LOGS_DIR, PROJECT_NAME } from '../utils/files';
import { fs } from 'mz';

const getProcessTail = async (projectName: string, serviceName: string) => {
  const fileName = `${CHIP_LOGS_DIR}/${projectName}/${serviceName}.log`;
  // const fileName = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;
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

export const logServicesX = async () => {
  const processes = (await getAllProcesses(PROJECT_NAME)) || {};

  for (const [name] of Object.entries(processes)) {
    logService(PROJECT_NAME, name);
  }
};

const prefixColors = [
  chalk.red,
  chalk.green,
  chalk.yellow,
  chalk.blue,
  chalk.magenta,
  chalk.cyan,
  chalk.redBright,
  chalk.greenBright,
  chalk.yellowBright,
  chalk.blueBright,
  chalk.magentaBright,
  chalk.cyanBright,
];

export const logServices = async () => {
  const processes = (await getAllProcesses(PROJECT_NAME)) || {};

  const longestServiceName = (Object.keys(processes).sort(
    (a, b) => b.length - a.length,
  ) || [''])[0];

  const colorForService: { [name: string]: chalk.Chalk } = {};
  Object.keys(processes).forEach((name, idx) => {
    colorForService[name] = prefixColors[idx % prefixColors.length];
  });

  const allLines = [];
  for (const [name] of Object.entries(processes)) {
    const fileName = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${name}.log.timestamps`;
    const contents = await fs.readFile(fileName, 'utf8');
    const lines = contents.split('\n').map((line) => {
      const firstSpace = line.indexOf(' ');
      const timestamp = Number(line.substring(0, firstSpace));
      const log = line.substring(firstSpace + 1);
      return { timestamp, log, serviceName: name };
    });
    allLines.push(...lines);
  }

  allLines.sort((a, b) => a.timestamp - b.timestamp);
  for (const { serviceName, log } of allLines) {
    const color = colorForService[serviceName];
    const padLength = longestServiceName.length;
    const servicePrefix = color(
      chalk`{bold ${serviceName.padEnd(padLength)} | }`,
    );
    console.log(servicePrefix + log);
  }
};
