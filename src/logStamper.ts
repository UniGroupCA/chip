import fs from 'mz/fs';
import readline from 'readline';

const [, , stampFilePath] = process.argv;

(async () => {
  const stampFd = await fs.open(stampFilePath, 'w');
  const stampFile = fs.createWriteStream(stampFilePath, { fd: stampFd });

  process.on('exit', () => stampFile.close());
  process.on('SIGINT', () => stampFile.close());
  process.on('SIGTERM', () => stampFile.close());

  const rl = readline.createInterface({ input: process.stdin });

  rl.on('line', (line) => {
    const timestamp = process.hrtime.bigint().toString();
    console.log(line);
    stampFile.write(`${timestamp} ${line}\n`);
  });
})();
