import fs from 'fs';
import readline from 'readline';

const [, , stampFilePath] = process.argv;

(async () => {
  const stampFile = fs.createWriteStream(stampFilePath, { flags: 'w' });

  process.on('exit', () => stampFile.close());
  process.on('SIGINT', () => stampFile.close());
  process.on('SIGTERM', () => stampFile.close());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    const timestamp = process.hrtime();
    console.log(line);
    stampFile.write(`${timestamp} ${line}\n`);
  });
})();
