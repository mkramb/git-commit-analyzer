import '@tensorflow/tfjs-node';

import { Document } from 'langchain/document';
import { TensorFlowEmbeddings } from '@langchain/community/embeddings/tensorflow';
import { QdrantVectorStore } from '@langchain/qdrant';
import createDebug from 'debug';

import { CommitHistory } from './extract-history.js';

const debug = createDebug('services/import-document');
const embeddings = new TensorFlowEmbeddings();

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  collectionName: 'git_commit_history',
});

export const importDocument = (commit: CommitHistory, repositoryName: string) => {
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
      repository_name: repositoryName,
    },
  });

  debug('Adding new commit document', commit.hash);

  vectorStore.addDocuments([document]);
};
