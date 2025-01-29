import { QdrantVectorStore } from '@langchain/qdrant';
import { embeddings } from './ollama.js';

export const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL ?? 'http://localhost:6333',
  collectionName: 'git_commit_history',
});
