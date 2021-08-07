import yargs from 'yargs';

import { initChip, assertSubdirs } from './utils/init';
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
import { cleanNames } from './utils/strings';

yargs
  .command<{ services: string[] }>(
    'sync [services|tags..]',
    'Clone or pull repos for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await syncServices(cleanNames(services));
    }),
  )
  .command<{ branch: string; services: string[] }>(
    'checkout <branch> [services|tags..]',
    'Checkout a git branch for services in project',
    (yargs) =>
      yargs
        .positional('branch', { describe: 'git branch name' })
        .positional('services', { describe: 'service names' }),
    handleErrors(async ({ branch, services }) => {
      await initChip();
      await assertSubdirs();
      await checkoutServices(branch, cleanNames(services));
    }),
  )
  .command<{ services: string[] }>(
    'status [services|tags..]',
    'Show git status for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await assertSubdirs();
      await statusServices(cleanNames(services));
    }),
  )
  .command<{ services: string[] }>(
    'install [services|tags..]',
    'Install dependencies for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await assertSubdirs();
      await installServices(cleanNames(services));
    }),
  )
  .command<{ services: string[] }>(
    'start [services|tags..]',
    'Start services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await assertSubdirs();
      await startServices(cleanNames(services));
    }),
  )
  .command<{ services: string[]; remove: boolean }>(
    'stop [services|tags..]',
    'Stop services in project',
    (yargs) =>
      yargs.positional('services', { describe: 'service names' }).option('r', {
        alias: ['remove', 'rm'],
        type: 'boolean',
        describe:
          'Remove containers after stopping them. Only applies to docker-compose services. If you have a database service and want to clear/reset it, you could use this option.',
      }),
    handleErrors(async ({ services, remove = false }) => {
      await initChip();
      await assertSubdirs();
      await stopServices(cleanNames(services), remove);
    }),
  )
  .command<{ services: string[]; remove: boolean }>(
    'restart [services|tags..]',
    'Stop and restart services in project',
    (yargs) =>
      yargs.positional('services', { describe: 'service names' }).option('r', {
        alias: ['remove', 'rm'],
        type: 'boolean',
        describe:
          'Remove containers after stopping them. Only applies to docker-compose services. If you have a database service and want to clear/reset it, you could use this option.',
      }),
    handleErrors(async ({ services, remove = false }) => {
      await initChip();
      await assertSubdirs();
      await restartServices(cleanNames(services), remove);
    }),
  )
  .command<{ services: string[] }>(
    'logs [services|tags..]',
    'View logs for services in project',
    (yargs) => yargs.positional('services', { describe: 'service names' }),
    handleErrors(async ({ services }) => {
      await initChip();
      await assertSubdirs();
      await logServices(cleanNames(services));
    }),
  )
  .command(
    'list',
    'List all services in project',
    {},
    handleErrors(async () => {
      await initChip();
      await assertSubdirs();
      await listServices();
    }),
  )
  .help()
  .strict()
  .demandCommand().argv;
