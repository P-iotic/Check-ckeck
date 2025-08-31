const { exec } = require('child_process');

console.log('Killing processes on port 3001...');

// For Windows
exec('netstat -ano | findstr :3001', (error, stdout, stderr) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      console.log(`Killing process with PID: ${pid}`);
      exec(`taskkill /PID ${pid} /F`);
    });
  } else {
    console.log('No processes found on port 3001');
  }
});