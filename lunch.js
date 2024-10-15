const exec = require('child_process').exec;

function exec_command(command) {
  return new Promise((resolve, reject) => exec(command, (error, stdout, stderr) => {
    if (error) reject(error);
    if (stderr) reject(stderr);
    if (stdout) resolve(stdout);
  }))
}

(async () => {
  console.log(await exec_command('cd backend && node --env-file=.env ./dist/index.js'))
})()