import chalk from 'chalk';
// import { Tail } from 'tail';
import { maxBy } from 'lodash';

import { CHIP_LOGS_DIR, PROJECT_NAME } from '../utils/files';
import { fs } from 'mz';
import { readServices } from '../utils/config';
import { spawn } from 'child_process';

// const getProcessTail = async (projectName: string, serviceName: string) => {
//   const fileName = `${CHIP_LOGS_DIR}/${projectName}/${serviceName}.log`;
//   // const fileName = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;
//   return new Tail(fileName, { logger: console });
// };

// export const logService = async (
//   projectName: string,
//   serviceName: string,
//   padLength: number,
//   color: chalk.Chalk,
// ) => {
//   const tail = await getProcessTail(projectName, serviceName);

//   tail.on('line', (data: any) => {
//     const servicePrefix = color(
//       chalk`{bold [L] ${serviceName.padEnd(padLength)} | }`,
//     );
//     console.log(servicePrefix + data);
//   });

//   tail.on('error', (error: any) => {
//     console.error(
//       chalk`{red Error tailing logs for {bold ${serviceName}}: ${error}}`,
//     );
//   });
// };

export const logService = async (
  projectName: string,
  serviceName: string,
  padLength: number,
  color: chalk.Chalk,
) => {
  const fileName = `${CHIP_LOGS_DIR}/${projectName}/${serviceName}.log`;
  const subprocess = spawn('tail', ['-f', fileName]);
  [subprocess.stdout, subprocess.stderr].forEach((stream) => {
    let prevData = '';
    stream.on('data', (data: string) => {
      const allData = prevData + data;
      const lines = allData.split('\n');
      if (lines.length > 1 && lines[lines.length - 1] !== '') {
        prevData = lines[lines.length - 1];
      }
      lines
        .slice(
          0,
          lines.length > 1 && lines[lines.length - 1] !== ''
            ? lines.length - 2
            : lines.length - 1,
        )
        .forEach((line) => {
          const servicePrefix = color(
            chalk`{bold [L] ${serviceName.padEnd(padLength)} | }`,
          );
          console.log(servicePrefix + line);
        });
    });
    stream.on('exit', (data: string) => {
      console.log('Exited:', data);
    });
    stream.on('error', (data: string) => {
      console.error('Error:', data);
    });
  });
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

/*
Flow for `chip logs`:
  1. Read in all timestamped log files.
  2. Count the lines in each file from (1).
  3. Start tailing each timestamped log file (from the beginning).
  4. When tailed file emits a line, queue it up in a common array.
    - Skip the line if it is less than the count from (2).
    - Maybe not necessary if this isn't done asynchronous.
  5. Sort and print logs from the timestamped files.
  6. Begin emitting lines from queue in (4) - live.
*/

interface Log {
  timestamp: number;
  log: string;
  serviceName: string;
}

const printLog = (
  { serviceName, log }: Log,
  padLength: number,
  color: chalk.Chalk,
) => {
  const servicePrefix = color(
    chalk`{bold [H] ${serviceName.padEnd(padLength)} | }`,
  );
  console.log(servicePrefix + log);
};

// TODO: Implement line skipping!
export const logServices = async () => {
  const services = await readServices();
  const serviceNames = services.map(({ name }) => name);
  const longestServiceName = (maxBy(serviceNames, 'length') || '').length;

  const colorForService: { [name: string]: chalk.Chalk } = {};
  serviceNames.forEach((name, idx) => {
    colorForService[name] = prefixColors[idx % prefixColors.length];
  });

  const logs: Log[] = [];
  const initialLinesForService: { [name: string]: number } = {};

  for (const serviceName of serviceNames) {
    const fileName = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;
    if (await fs.exists(fileName)) {
      const contents = await fs.readFile(fileName, 'utf8');
      const lines = contents.split('\n').map((line) => {
        const firstSpace = line.indexOf(' ');
        const timestamp = Number(line.substring(0, firstSpace));
        const log = line.substring(firstSpace + 1);
        return { timestamp, log, serviceName };
      });
      initialLinesForService[serviceName] = lines.length;
      logs.push(...lines);
    }
  }

  logs.sort((a, b) => a.timestamp - b.timestamp);
  for (const log of logs) {
    printLog(log, longestServiceName, colorForService[log.serviceName]);
  }

  for (const serviceName of serviceNames) {
    const fileName = `${CHIP_LOGS_DIR}/${PROJECT_NAME}/${serviceName}.log.timestamps`;
    if (await fs.exists(fileName)) {
      logService(
        PROJECT_NAME,
        serviceName,
        longestServiceName,
        colorForService[serviceName],
      );
    }
  }
};
