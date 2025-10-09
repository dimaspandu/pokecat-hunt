import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Go service folder
const goServicePath = path.join(__dirname, '..', 'services');

// Start the Go server asynchronously
const goServer = spawn('go', ['run', 'main.go'], {
  cwd: goServicePath,
  stdio: 'inherit'
});

// Listen for Go server exit
goServer.on('close', (code) => {
  console.log(`Go server exited with code ${code}`);
});
