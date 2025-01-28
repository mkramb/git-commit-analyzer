import { Document } from 'langchain/document';
import createDebug from 'debug';

import { CommitHistory } from './extract-history.js';
import { vectorStore } from '../store.js';

const debug = createDebug('services/import-document');

export const importDocument = (commit: CommitHistory) => {
  const text = `
      A commit was made by ${commit.author_name} with email ${commit.author_email},
      on date ${commit.date}, with a message "${commit.message}".
  `;

  const document = new Document({
    pageContent: text,
    metadata: {
      hash: commit.hash,
      date: commit.date,
      author_name: commit.author_name,
      author_email: commit.author_email,
    },
  });

  debug('Adding new commit document', commit.hash);

  vectorStore.addDocuments([document]);
};
