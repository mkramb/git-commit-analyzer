import { vectorStore } from '../store.js';

export interface QueryResponse {
  content: string;
  metadata: Record<string, any>;
}

export const queryStore = async (queryText: string, topK = 1): Promise<QueryResponse[]> => {
  const results = await vectorStore.similaritySearch(queryText, topK);
  const response: QueryResponse[] = [];

  for (const item of results) {
    response.push({
      content: item.pageContent,
      metadata: item.metadata,
    });
  }

  return response;
};
