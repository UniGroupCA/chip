import { bold } from 'chalk';
import { table } from 'table';

import * as git from '../utils/git';
import fs from 'mz/fs';
import { readServices } from '../utils/config';
import { getActiveProcesses } from '../utils/ps';
import { PROJECT_NAME } from '../utils/files';
import { exec } from '../utils/processes';

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

  if (await fs.exists(`./docker-compose.yml`)) {
    const psOutput = await exec(`docker-compose ps`, {
      cwd: '.',
      live: false,
    });

    const psTrimmed = psOutput
      .split('\n')
      .slice(2)
      .filter(Boolean);

    for (const line of psTrimmed) {
      const [name, cmd, status] = line.split(/\s{3,}/g);

      tableData.push([
        name,
        cmd.substring(0, 20) + (cmd.length > 20 ? '...' : ''),
        status,
        '',
        '',
      ]);
    }
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
