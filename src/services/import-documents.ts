import { Document } from 'langchain/document';
import createDebug from 'debug';

import { vectorStore } from '../store.js';
import { CommitHistory } from './extract-history.js';

const debug = createDebug('services:import-document');

export const importDocuments = async (commits: CommitHistory[]) => {
  debug('Importing documents', commits.length);

  const documents = [];

  for (const commit of commits) {
    const text = [
      `A commit was made by "${commit.author_name}"`,
      `, with email "${commit.author_email}"`,
      `, on date "${commit.date}"`,
      `, with a message "${commit.message}"`,
      `, where the following files were updated: \n${commit.files.map((file) => `- ${file}`).join('\n')}`,
    ].join('');

    documents.push(
      new Document({
        pageContent: text,
        metadata: {
          hash: commit.hash,
          date: commit.date,
          author_name: commit.author_name,
          author_email: commit.author_email,
        },
      }),
    );
  }

  debug('Adding new documents');

  await vectorStore.ensureCollection();
  await vectorStore.addDocuments(documents);

  debug('Completed adding new documents');
};
