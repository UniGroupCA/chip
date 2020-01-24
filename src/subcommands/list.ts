import { bold } from 'chalk';
import { table } from 'table';

import * as git from '../utils/git';
import fs from 'mz/fs';
import { readServices } from '../utils/config';
import { getActiveProcesses } from '../utils/ps';
import { PROJECT_NAME } from '../utils/files';
import { exec } from '../utils/processes';

const dockerServices = async () => {
  const services: string[][] = [];

  if (await fs.exists(`./docker-compose.yml`)) {
    const rawOutput = await exec(`docker-compose ps`, {
      cwd: '.',
      live: false,
    });

    const trimmedOutput = rawOutput
      .split('\n')
      .slice(2)
      .filter(Boolean);

    for (const line of trimmedOutput) {
      const [name, cmd, status] = line.split(/\s{3,}/g);
      services.push([name, cmd, status, '', '']);
    }
  }
  return services;
};

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

  tableData.push(...(await dockerServices()));

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
