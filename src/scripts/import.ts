import yargs from 'yargs/yargs';
import createDebug from 'debug';

import { exportHistory } from '../services/extract-history';
import { importDocument } from '../services/import-document';

const debug = createDebug('scripts/import');

const { repositoryName, repositoryPath } = yargs(process.argv.slice(2))
  .options({
    repositoryName: { type: 'string', demandOption: true },
    repositoryPath: { type: 'string', demandOption: true },
  })
  .parseSync();

const importRepository = async (): Promise<void> => {
  const commitStream = await exportHistory(repositoryName, repositoryPath);

  try {
    for await (const commit of commitStream) {
      importDocument(commit);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

importRepository();
