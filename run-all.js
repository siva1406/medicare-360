import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const port = process.env.PORT || 5000;

// 1. Ensure server dependencies are installed
const serverModules = path.join(__dirname, 'server', 'node_modules');
if (!fs.existsSync(serverModules)) {
  console.log('📦 Installing backend dependencies...');
  try {
    execSync(`${npmCmd} install`, { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Server install notice:', err.message);
  }
}

// 2. Ensure client dependencies are installed
const clientModules = path.join(__dirname, 'client', 'node_modules');
if (!fs.existsSync(clientModules)) {
  console.log('📦 Installing frontend dependencies...');
  try {
    execSync(`${npmCmd} install`, { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Client install notice:', err.message);
  }
}

// 3. Ensure frontend production assets are built
const clientDist = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(clientDist) || !fs.existsSync(path.join(clientDist, 'index.html'))) {
  console.log('📦 Frontend bundle not found. Building production assets...');
  try {
    execSync(`${npmCmd} run build`, { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
    console.log('✓ Frontend build completed successfully.\n');
  } catch (buildErr) {
    console.warn('⚠️ Automated frontend build warning:', buildErr.message);
  }
}

console.log('================================================================');
console.log('  🏥 MediCare 360 - Smart Healthcare Management System');
console.log('================================================================');
console.log('  Starting full-stack production server on:');
console.log(`  👉 Web App & REST API: http://localhost:${port}\n`);
console.log('  Demo Credentials:');
console.log('  • Admin:        admin@medicare360.com        / admin123');
console.log('  • Doctor:       doctor@medicare360.com       / doctor123');
console.log('  • Receptionist: receptionist@medicare360.com / reception123');
console.log('  • Patient:      patient@medicare360.com      / patient123');
console.log('================================================================\n');

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  env: { ...process.env, PORT: String(port) }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit();
});
