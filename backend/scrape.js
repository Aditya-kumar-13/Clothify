import { spawn } from 'child_process';
import path from 'path';

export function runScraper(caption) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'playwright_scrape.js');

    const child = spawn('node', [scriptPath, caption]);

    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      error += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Scraper exited with code ${code}: ${error}`));
      } else {
        try {
          const data = JSON.parse(output);
          resolve(data);
        } catch (err) {
          reject(new Error(`Failed to parse scraper output: ${err.message}`));
        }
      }
    });
  });
}
