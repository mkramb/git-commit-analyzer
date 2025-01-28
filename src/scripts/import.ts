import yargs from 'yargs/yargs';

import { exportHistory } from '../services/extract-history.js';
import { importDocument } from '../services/import-document.js';

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
      importDocument(commit, repositoryName);
    }
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('Completed!');
};

importRepository();
