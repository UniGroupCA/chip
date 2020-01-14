import fs from 'mz/fs';
import readline from 'readline';

const [, , stampFilePath] = process.argv;

// (async () => {
//   const stampFile = fs.createWriteStream(stampFilePath, { flags: 'w' });

//   process.on('exit', () => stampFile.close());
//   process.on('SIGINT', () => stampFile.close());
//   process.on('SIGTERM', () => stampFile.close());

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     terminal: false,
//   });

//   rl.on('line', (line) => {
//     const timestamp = process.hrtime.bigint().toString();
//     console.log(line);
//     stampFile.write(`${timestamp} ${line}\n`);
//   });
// })();

// (async () => {
//   const stampFile = await fs.open(stampFilePath, 'w');

//   process.on('exit', () => fs.closeSync(stampFile));
//   process.on('SIGINT', () => fs.closeSync(stampFile));
//   process.on('SIGTERM', () => fs.closeSync(stampFile));

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     terminal: false,
//   });

//   // TODO: Implement periodic flushes...
//   rl.on('line', async (line) => {
//     const timestamp = process.hrtime.bigint().toString();
//     console.log(line);
//     await fs.writeFile(stampFile, `${timestamp} ${line}\n`);
//     // await fs.fdatasync(stampFile);
//   });
// })();

(async () => {
  const stampFd = await fs.open(stampFilePath, 'w');
  const stampFile = fs.createWriteStream(stampFilePath, { fd: stampFd });

  process.on('exit', () => stampFile.close());
  process.on('SIGINT', () => stampFile.close());
  process.on('SIGTERM', () => stampFile.close());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', async (line) => {
    const timestamp = process.hrtime.bigint().toString();
    console.log(line);
    stampFile.write(`${timestamp} ${line}\n`);
    setTimeout(() => fs.fdatasyncSync(stampFd), 100);
  });
})();
