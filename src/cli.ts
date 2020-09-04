import yargs from 'yargs';

import { initChip } from './utils/ps';
import { handleErrors } from './utils/errors';

import { syncServices } from './subcommands/sync';
import { installServices } from './subcommands/install';
import { startServices } from './subcommands/start';
import { stopServices } from './subcommands/stop';
import { restartServices } from './subcommands/restart';
import { listServices } from './subcommands/list';
import { logServices } from './subcommands/logs';
import { checkoutServices } from './subcommands/checkout';
import { statusServices } from './subcommands/status';

yargs
  .command<{ services: string[] }>(
    'sync [services..]',
    'Clone or pull repos for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await syncServices(services);
    }),
  )
  .command<{ branch: string; services: string[] }>(
    'checkout <branch> [services..]',
    'Checkout a git branch for services in project',
    (yargs) =>
      yargs
        .positional('branch', { describe: 'git branch name' })
        .positional('services', { describe: 'service names' }),
    handleErrors(async ({ branch, services }) => {
      await initChip();
      await checkoutServices(branch, services);
    }),
  )
  .command<{ services: string[] }>(
    'status [services..]',
    'Show git status for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await statusServices(services);
    }),
  )
  .command<{ services: string[] }>(
    'install [services..]',
    'Install dependencies for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await installServices(services);
    }),
  )
  .command<{ services: string[] }>(
    'start [services..]',
    'Start services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await startServices(services);
    }),
  )
  .command<{ services: string[] }>(
    'stop [services..]',
    'Stop services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await stopServices(services);
    }),
  )
  .command<{ services: string[] }>(
    'restart [services..]',
    'Stop and restart services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await restartServices(services);
    }),
  )
  .command<{ services: string[] }>(
    'logs [services..]',
    'View logs for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await logServices(services);
    }),
  )
  .command(
    'list',
    'List all services in project',
    {},
    handleErrors(async () => {
      await initChip();
      await listServices();
    }),
  )
  .help()
  .strict()
  .demandCommand().argv;
