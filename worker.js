import { Worker } from '@temporalio/worker';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as activities from './activities.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function run() {
  const worker = await Worker.create({
    // Resolves your absolute file pathway within native Node ES Module parameters
    workflowsPath: resolve(__dirname, './workflows.js'),
    activities,
    taskQueue: 'hotel-offers-queue',
    connectionOptions: {
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
    }
  });

  console.log('Background Temporal worker loop online & listening to task queue...');
  await worker.run();
}

run().catch((err) => {
  console.error('Worker runtime loop encountered a fatal exception:', err);
  process.exit(1);
});
