import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import createDebug from 'debug';

import { vectorStore } from '../store.js';
import { model } from '../ollama.js';

const debug = createDebug('services:query-store');

export interface QueryResponse {
  content: string;
}

const PROMPT_TEMPLATE =
  process.env.PROMPT_TEMPLATE ??
  `
  Use the following pieces of context, given between two character sets ">>>" and "<<<", to answer the question about the commit messages. Each commit message is in format of:
  A commit was made by <author name> with email <author email>, on date <commit date>, with a message <commit message>, where the following files were updated <list of files>
  ----------------
  CONTEXT: >>> {context} <<<
  ANSWER: (should be nicely formatted as plaintext)
`;

export const queryStore = async (inputPrompt: string): Promise<QueryResponse> => {
  const messages = [
    SystemMessagePromptTemplate.fromTemplate(PROMPT_TEMPLATE),
    HumanMessagePromptTemplate.fromTemplate('{question}'),
  ];

  const prompt = ChatPromptTemplate.fromMessages(messages);
  const chain = RunnableSequence.from([
    {
      context: vectorStore
        .asRetriever({
          k: 20,
          searchType: 'mmr',
          searchKwargs: {
            lambda: 1,
          },
        })
        .pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  debug('Invoking query');

  const answer = await chain.invoke(inputPrompt);
  const response: QueryResponse = {
    content: String(answer).trim(),
  };

  return response;
};
