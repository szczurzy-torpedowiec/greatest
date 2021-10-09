import fastify from 'fastify';
import FastifySensible from 'fastify-sensible';
import FastifySecureSession from 'fastify-secure-session';
import fsPromises from 'fs/promises';
import { parseMultipart } from './utils';
import { connectDb } from './database/database';
import { AuthPlugin } from './routes/auth';
import { config } from './config';
import { ApiPlugin } from './routes/register-api';
import { getProxyConstraint, WebsitePlugin } from './routes/register-website';

async function main() {
  const dbManager = await connectDb();
  const server = fastify({
    logger: true,
    constraints: {
      website: getProxyConstraint('website', [
        '/api/',
        '/auth/',
      ]),
    },
  });
  server.register(FastifySensible);
  server.register(FastifySecureSession, {
    key: await fsPromises.readFile('/run/secrets/session-key'),
    cookie: {
      httpOnly: true,
      secure: false, // TODO: Remove in production
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      path: '/',
    },
  });
  server.decorateRequest('files', null);
  server.addContentTypeParser('multipart/form-data', (request, payload, done) => {
    parseMultipart(request, payload)
      .then((result) => {
        request.files = result.files;
        done(null, result.fields);
      })
      .catch((error) => done(error, undefined));
  });
  server.addHook('preHandler', async (request, reply) => {
    const { schema } = reply.context;
    if (schema?.files === undefined) return;
    const fileFields = new Set<string>();
    if (request.files !== null) {
      Object.keys(request.files).forEach((field) => fileFields.add(field));
    }
    schema.files.forEach((field) => {
      if (!fileFields.has(field)) throw server.httpErrors.badRequest(`Missing "${field}" file field`);
    });
  });

  server.log.info('DB connected');
  server.register(AuthPlugin, {
    prefix: '/auth',
    dbManager,
  });
  server.register(ApiPlugin, {
    prefix: '/api',
    dbManager,
  });
  server.register(WebsitePlugin, {
    constraintName: 'website',
  });
  await server.listen(config.port, '0.0.0.0');
  server.log.info('Fastify ready');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
