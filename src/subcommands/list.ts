import { bold, green, red } from 'chalk';
import { table } from 'table';

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
    const pid = (activeProcesses[name] || {}).pid;
    const exists = !!pid;

    // prettier-ignore
    tableData.push([
      name,
      run.substring(0, 20) + (run.length > 20 ? '...' : ''),
      !run ? '' : (exists ? green('Running') : red('Stopped')),
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
