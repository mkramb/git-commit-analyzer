import async from 'async';
import yargs from 'yargs/yargs';
import createDebug from 'debug';

import { CommitHistory, exportHistory } from '../services/extract-history.js';
import { importDocuments } from '../services/import-documents.js';

const debug = createDebug('app:import');

const IMPORT_BATCH_SIZE = +(process.env.IMPORT_BATCH_SIZE ?? 100);
const IMPORT_MAX_CONCURRENCY = +(process.env.IMPORT_MAX_CONCURRENCY ?? 4);

const { repositoryPath } = yargs(process.argv.slice(2))
  .options({
    repositoryPath: {
      type: 'string',
      demandOption: true,
    },
  })
  .parseSync();

export const importRepository = async (): Promise<void> => {
  debug('Starting repository import');

  const commitQueue = async.queue<CommitHistory[], Error>(async (batch) => {
    await importDocuments(batch);
  }, IMPORT_MAX_CONCURRENCY);

  let batch: CommitHistory[] = [];

  try {
    for await (const commit of exportHistory(repositoryPath)) {
      batch.push(commit);

      if (batch.length >= IMPORT_BATCH_SIZE) {
        await commitQueue.pushAsync([batch]);
        batch = [];
      }

      if (commitQueue.length() >= IMPORT_MAX_CONCURRENCY) {
        debug('Waiting for queued items to be processed');
        await commitQueue.drain();
      }
    }

    if (batch.length > 0) {
      await commitQueue.pushAsync([batch]);
    }

    await commitQueue.drain();
    console.log('Completed!');
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
};

importRepository().catch((err) => {
  console.error('Import failed:', err);
});
