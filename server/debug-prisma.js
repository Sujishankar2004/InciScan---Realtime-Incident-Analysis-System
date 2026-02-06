const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.resolve(__dirname, 'prisma-debug.log');
const cmd = 'npx prisma generate';

console.log(`Running: ${cmd}`);
exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
    const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error ? error.message : 'None'}`;
    fs.writeFileSync(logFile, output);
    console.log(`Output written to ${logFile}`);
});
