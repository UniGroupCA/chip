import { bold, green, red } from 'chalk';
import { table } from 'table';
import humanize from 'humanize-duration';

import * as git from '../utils/git';
import * as docker from '../utils/docker';
import { readServices } from '../utils/config';
import { getActiveProcesses } from '../utils/ps';
import { PROJECT_NAME } from '../utils/files';

const dockerServices = async () => {
  if (!docker.isPresent()) return [];
  const services = await docker.listServices();
  return services.map(({ name, image, status }) => [
    name,
    image ?? '',
    status ?? '',
    ' 🐳',
    '',
  ]);
};

// TODO: Log orphans
export const listServices = async () => {
  const services = await readServices();
  const activeProcesses = await getActiveProcesses(PROJECT_NAME);

  const tableData = [
    [
      bold('SERVICE'),
      bold('COMMAND/IMAGE'),
      bold('STATUS'),
      bold('PID'),
      bold('BRANCH'),
    ],
  ];

  for (const { name, run = '' } of services) {
    const { pid, startTime } = activeProcesses[name] || {};
    const exists = !!pid;

    let status = '';
    if (run) {
      if (exists) {
        if (startTime) {
          const uptime = Date.now() - startTime!;
          status = green(
            `Up ${humanize(uptime, { largest: 1, maxDecimalPoints: 0 })}`,
          );
        } else {
          // Handle cases where `startTime === undefined` for backwards
          // compatibility
          status = green(`Up`);
        }
      } else {
        status = red('Stopped');
      }
    }

    // prettier-ignore
    tableData.push([
      name,
      run.substring(0, 20) + (run.length > 20 ? '...' : ''),
      status,
      exists ? String(pid) : '',
      await git.activeBranch(name),
    ]);
  }

  const startOfDockerIdx = tableData.length;
  tableData.push(...(await dockerServices()));

  console.log(
    table(tableData, {
      drawHorizontalLine: (idx, size) =>
        idx === 0 || idx === 1 || idx === size || idx === startOfDockerIdx,
      columns: {
        0: { alignment: 'left' },
        1: { alignment: 'left' },
        2: { alignment: 'left' },
        3: { alignment: 'left' },
        4: { alignment: 'left' },
      },
    }).trim(),
  );
};
