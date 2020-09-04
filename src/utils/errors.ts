import { log } from './log';

/**
 * Prints a succinct error message (without a full stack trace). Useful
 * for when non-fatal errors occur. Allows you to log them without polluting
 * stdout/stderr with stack traces that detract from other important output.
 */
export const printError = ({ output, message }: any) => {
  let msg = output || message || '---';
  if (typeof msg === 'string') msg = msg.trim();
  log`{red Error:} ${msg}`;
};

export const handleErrors = <T>(fn: (args: T) => Promise<void>) => async (
  args: T,
) => {
  try {
    await fn(args);
  } catch (e) {
    log`{red An error occurred}`;
    console.error(e);
    process.exit(1);
  }
};
