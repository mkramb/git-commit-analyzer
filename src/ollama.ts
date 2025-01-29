import { Ollama, OllamaEmbeddings } from '@langchain/ollama';

const ollamaModel = process.env.OLLAMA_MODEL ?? 'llama3.2';
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';

export const model = new Ollama({
  baseUrl: ollamaBaseUrl,
  model: ollamaModel,
  temperature: 0.1,
});

export const embeddings = new OllamaEmbeddings({
  baseUrl: ollamaBaseUrl,
  model: ollamaModel,
});
