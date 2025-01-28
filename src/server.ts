import fastify from 'fastify';
import { queryRoute } from './routes/query.js';

const server = fastify();

server.get('/query', queryRoute);
server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
