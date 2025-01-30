import async from 'async';
import yargs from 'yargs/yargs';
import createDebug from 'debug';

import { CommitHistory, exportHistory } from '../services/extract-history.js';
import { importDocuments } from '../services/import-documents.js';

const debug = createDebug('app:import');

const IMPORT_BATCH_SIZE = +(process.env.IMPORT_BATCH_SIZE ?? 50);
const IMPORT_MAX_CONCURRENCY = +(process.env.IMPORT_MAX_CONCURRENCY ?? 1);

const { repositoryPath } = yargs(process.argv.slice(2))
  .options({
    repositoryPath: {
      type: 'string',
      demandOption: true,
    },
  })
  .parseSync();

const importRepository = async (): Promise<void> => {
  const commitQueue = async.queue<CommitHistory[], Error>(async (batch) => {
    await importDocuments(batch);
  }, IMPORT_BATCH_SIZE);

  let batch: CommitHistory[] = [];

  const commitStream = exportHistory(repositoryPath);

  for await (const commit of commitStream) {
    batch.push(commit);

    if (batch.length >= IMPORT_BATCH_SIZE) {
      commitQueue.push([batch]);
      batch = [];
    }

    if (commitQueue.length() >= IMPORT_MAX_CONCURRENCY) {
      debug('Waiting for queued items');
      await commitQueue.drain();
    }
  }

  if (batch.length > 0) {
    commitQueue.push([batch]);
  }

  await commitQueue.drain();
  console.log('Completed!');
};

importRepository();
