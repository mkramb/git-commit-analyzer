import { FastifyReply, FastifyRequest } from 'fastify';

import { queryStore } from '../services/query-store.js';

export interface QueryBody {
  prompt: string;
}

export const queryRoute = async (
  request: FastifyRequest<{ Body: QueryBody }>,
  reply: FastifyReply,
) => {
  const { prompt } = request.body;
  const results = await queryStore(prompt);

  reply.code(200).send(results);
};
