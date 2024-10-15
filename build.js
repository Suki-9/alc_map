const exec = require('child_process').exec;
const fs = require('fs');

function exec_command(command) {
  return new Promise((resolve, reject) => exec(command, (error, stdout, stderr) => {
    if (error) reject(error);
    if (stderr) reject(stderr);
    if (stdout) resolve(stdout);
  }))
}

async function init_backend(port) {
  fs.writeFileSync('./backend/.env', `PORT='${port}'`);

  console.log(await exec_command('cd backend && pnpm i'))
  console.log(await exec_command('cd backend && pnpm build'))
}

async function init_frontend(host) {
  fs.writeFileSync('./frontend/.env.production', `VITE_HOST='${host}'`);

  console.log(await exec_command('cd frontend && pnpm i'))
  console.log(await exec_command('cd frontend && pnpm build --emptyOutDir'))
}

(async () => {
  const host = new URL(process.argv[2]);
  await Promise.all([init_backend(host.port), init_frontend(host.protocol + '//' + host.hostname)]);
})()
