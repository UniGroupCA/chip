import { log } from './log';

export const printError = ({ output, message }: any) => {
  log`{red Error:} ${(output || message).trim()}`;
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
