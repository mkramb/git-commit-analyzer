import { FastifyReply, FastifyRequest } from 'fastify';

export const queryRoute = async (_request: FastifyRequest, reply: FastifyReply) => {
  reply.code(200).send({ results: true });
};
