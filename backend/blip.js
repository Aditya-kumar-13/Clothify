import { spawn } from 'child_process';
import path from 'path';

export function generateCaption(imagePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'blip.py');

    const python = spawn('python', [scriptPath, imagePath]);

    let output = '';
    let error = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${error}`));
      } else {
        resolve(output.trim());
      }
    });
  });
}
