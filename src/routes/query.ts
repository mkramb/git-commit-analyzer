import { FastifyReply, FastifyRequest } from 'fastify';
import { QueryResponse, queryStore } from '../services/query-store.js';

export interface QueryParams {
  text?: string;
}

export const queryRoute = async (
  request: FastifyRequest<{ Querystring: QueryParams }>,
  reply: FastifyReply,
) => {
  const query = request.query;
  let results: QueryResponse[] = [];

  if (query.text) {
    results = await queryStore(query.text);
  }

  reply.code(200).send({
    results,
  });
};
