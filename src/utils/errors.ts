import { log } from './log';

export const printError = (error: any) => {
  log`{red An error occurred}`;
  console.error(error);
};

export const handleErrors = <T>(fn: (args: T) => Promise<void>) => async (
  args: T,
) => {
  try {
    await fn(args);
  } catch (e) {
    printError(e);
    process.exit(1);
  }
};
