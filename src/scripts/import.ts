import yargs from 'yargs/yargs';

import { exportHistory } from '../services/extract-history.js';
import { importDocument } from '../services/import-document.js';

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
  const documentImport = [];

  try {
    for await (const commit of commitStream) {
      documentImport.push(importDocument(commit));
    }
  } catch (error) {
    console.error('Error:', error);
  }

  await Promise.all(documentImport);
  console.log('Completed!');
};

importRepository();
