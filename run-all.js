import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-build client distribution if missing
const clientDist = path.join(__dirname, 'client', 'dist');
if (!fs.existsSync(clientDist)) {
  console.log('📦 Frontend bundle not found. Building production assets...');
  try {
    execSync('npm run build', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
    console.log('✓ Frontend build completed successfully.\n');
  } catch (buildErr) {
    console.warn('⚠️ Automated frontend build warning:', buildErr.message);
  }
}

console.log('================================================================');
console.log('  🏥 MediCare 360 - Smart Healthcare Management System');
console.log('================================================================');
console.log('  Starting full-stack production server on:');
console.log('  👉 Web App & REST API: http://localhost:5000\n');
console.log('  Demo Credentials:');
console.log('  • Admin:        admin@medicare360.com        / admin123');
console.log('  • Doctor:       doctor@medicare360.com       / doctor123');
console.log('  • Receptionist: receptionist@medicare360.com / reception123');
console.log('  • Patient:      patient@medicare360.com      / patient123');
console.log('================================================================\n');

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  server.kill('SIGINT');
  process.exit();
});
