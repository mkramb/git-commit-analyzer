import async from 'async';
import yargs from 'yargs/yargs';

import { CommitHistory, exportHistory } from '../services/extract-history.js';
import { importDocument } from '../services/import-document.js';

const IMPORT_DOCUMENT_MAX_CONCURRENCY = +(process.env.IMPORT_DOCUMENT_MAX_CONCURRENCY ?? 20);

const { repositoryPath } = yargs(process.argv.slice(2))
  .options({
    repositoryPath: {
      type: 'string',
      demandOption: true,
    },
  })
  .parseSync();

const importRepository = async (): Promise<void> => {
  const commitStream = await exportHistory(repositoryPath);
  const commitQueue = async.queue<CommitHistory, Error>(async (commit) => {
    await importDocument(commit);
  }, IMPORT_DOCUMENT_MAX_CONCURRENCY);

  for await (const commit of commitStream) {
    commitQueue.push(commit);
  }

  if (commitQueue.length() > 0) {
    await commitQueue.drain();
  }

  console.log('Completed!');
};

importRepository();
