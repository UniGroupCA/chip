import { bold } from 'chalk';
import { table } from 'table';

import * as git from '../utils/git';
import { readServices } from '../utils/config';
import { getActiveProcesses } from '../utils/ps';
import { PROJECT_NAME } from '../utils/files';

// TODO: Log orphans
export const listServices = async () => {
  const services = await readServices();
  const activeProcesses = await getActiveProcesses(PROJECT_NAME);

  const tableData = [
    [
      bold('SERVICE'),
      bold('COMMAND'),
      bold('STATUS'),
      bold('PID'),
      bold('BRANCH'),
    ],
  ];

  for (const { name, run } of services) {
    const pid = (activeProcesses[name] || {}).pid;
    const exists = !!pid;

    tableData.push([
      name,
      (run || '').substring(0, 20) + ((run || '').length > 20 ? '...' : ''),
      exists ? 'Running' : 'Stopped',
      exists ? String(pid) : '',
      await git.activeBranch(name),
    ]);
  }

  console.log(
    table(tableData, {
      drawHorizontalLine: (idx, size) => idx === 0 || idx === 1 || idx === size,
      columns: {
        0: { alignment: 'left' },
        1: { alignment: 'left' },
        2: { alignment: 'left' },
        3: { alignment: 'left' },
        4: { alignment: 'left' },
      },
    }),
  );
};
