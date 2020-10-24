import fs from 'mz/fs';
import {
  CHIP_DIR,
  CHIP_PROCESSES_FILE,
  writeJsonFile,
  CHIP_LOGS_DIR,
  CWD,
} from './files';
import { printError } from './errors';
import { readServices } from './config';

export const initChip = async () => {
  if (!(await fs.exists(CHIP_DIR))) await fs.mkdir(CHIP_DIR);
  if (!(await fs.exists(CHIP_LOGS_DIR))) await fs.mkdir(CHIP_LOGS_DIR);

  if (!(await fs.exists(CHIP_PROCESSES_FILE))) {
    writeJsonFile(CHIP_PROCESSES_FILE, {});
  }

  if (!(await fs.exists('./chip.yml'))) {
    printError({ message: `No chip.yml file found in ${CWD}` });
    process.exit(1);
  }
};

export const assertSubdirs = async () => {
  const services = await readServices();
  for (const { name } of services) {
    if (!(await fs.exists(name))) {
      const message = `${name} is defined in chip.yml but no ./${name} directory exists. Have you run \`chip sync\`?`;
      printError({ message });
      process.exit(1);
    }
  }
};
