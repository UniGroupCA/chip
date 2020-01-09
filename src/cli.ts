import yargs from 'yargs';
import { syncServices } from './subcommands/sync';

yargs
  .command(
    'sync',
    'Clone or pull repos for all services in project',
    {},
    () => {
      syncServices();
    },
  )
  .command(
    'install',
    'Install dependencies for all services in project',
    {},
    () => {},
  )
  .command('start', 'Start all services in project', {}, () => {
    console.log('TODO: Implement me');
  })
  .command('stop', 'Stop all services in project', {}, () => {
    console.log('TODO: Implement me');
  })
  .command('logs', 'View logs for all services in project', {}, () => {
    console.log('TODO: Implement me');
  })
  .command('list', 'List all services in project', {}, () => {
    console.log('TODO: Implement me');
  })
  .help().argv;
