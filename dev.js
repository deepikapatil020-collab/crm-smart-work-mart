const { spawn } = require('child_process');

console.log('=====================================================');
console.log('🚀 Starting Smart Work Mart CRM (Server + Client)...');
console.log('=====================================================\n');

// 1. Start Server
const server = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Start Client (Vite Dev Server)
const client = spawn('npm', ['--prefix', 'client', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => console.error('[Server Error]:', err));
client.on('error', (err) => console.error('[Client Error]:', err));

function cleanup() {
  console.log('\n🛑 Shutting down services...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
