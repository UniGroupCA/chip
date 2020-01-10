import yargs from 'yargs';
import { syncServices } from './subcommands/sync';
import { installServices } from './subcommands/install';
import { initChip } from './utils/ps';
import { startServices } from './subcommands/start';
import { stopServices } from './subcommands/stop';

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
  .command(
    'install',
    'Install dependencies for all services in project',
    {},
    async () => {
      await initChip();
      await installServices();
    },
  )
  .command('start', 'Start all services in project', {}, async () => {
    await initChip();
    await startServices();
  })
  .command('stop', 'Stop all services in project', {}, async () => {
    await initChip();
    await stopServices();
  })
  .command('logs', 'View logs for all services in project', {}, () => {
    console.log('TODO: Implement me');
  })
  .command('list', 'List all services in project', {}, () => {
    console.log('TODO: Implement me');
  })
  .help().argv;
