import yargs from 'yargs';

import { syncServices } from './subcommands/sync';
import { installServices } from './subcommands/install';
import { initChip } from './utils/ps';
import { startServices } from './subcommands/start';
import { stopServices } from './subcommands/stop';
import { listServices } from './subcommands/list';
import { logServices } from './subcommands/logs';

yargs
  .command(
    'sync',
    'Clone or pull repos for all services in project',
    {},
    async () => {
      await initChip();
      await syncServices();
    },
  )
  .command<{ services: string[] }>(
    'install [services..]',
    'Install dependencies for services in project',
    async (yargs) => {
      yargs.positional('services', { describe: 'service names' });
    },
    async ({ services }) => {
      await initChip();
      await installServices(services);
    },
  )
  .command<{ services: string[] }>(
    'start [services..]',
    'Start services in project',
    async (yargs) => {
      yargs.positional('services', { describe: 'service names' });
    },
    async ({ services }) => {
      await initChip();
      await startServices(services);
    },
  )
  .command<{ services: string[] }>(
    'stop [services..]',
    'Stop services in project',
    async (yargs) => {
      yargs.positional('services', { describe: 'service names' });
    },
    async ({ services }) => {
      await initChip();
      await stopServices(services);
    },
  )
  .command('logs', 'View logs for all services in project', {}, async () => {
    await initChip();
    await logServices();
  })
  .command('list', 'List all services in project', {}, async () => {
    await initChip();
    await listServices();
  })
  .help()
  .strict()
  .demandCommand().argv;
