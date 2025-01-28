import '@tensorflow/tfjs-node';

import { TensorFlowEmbeddings } from '@langchain/community/embeddings/tensorflow';
import { QdrantVectorStore } from '@langchain/qdrant';

const embeddings = new TensorFlowEmbeddings();

export const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  collectionName: 'git_commit_history',
});
