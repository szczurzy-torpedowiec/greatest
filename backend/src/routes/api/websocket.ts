import { FastifyInstance, FastifyRequest } from 'fastify';
import FastifyWebsocket, { SocketStream } from 'fastify-websocket';
import { IncomingMessage } from 'http';
import { TestParams, testParamsSchema } from 'greatest-api-schemas';
import { DbManager } from '../../database/database';
import { requireAuthentication } from '../../guards';
import { DbTest, DbUser } from '../../database/types';

interface MyIncomingMessage extends IncomingMessage {
  greatest?: {
    error?: string;
    user?: DbUser;
    test?: DbTest;
  };
}

export interface WebsocketPluginOptions {
  dbManager: DbManager;
}
export async function WebsocketPlugin(
  wsInstance: FastifyInstance,
  { dbManager }: WebsocketPluginOptions,
) {
  const requireTest = async (shortId: string, user: DbUser) => {
    const test = await dbManager.testsCollection.findOne({
      shortId,
    });
    if (test === null) throw wsInstance.httpErrors.notFound('Test not found');
    if (!test.ownerId.equals(user._id)) throw wsInstance.httpErrors.forbidden();
    return test;
  };

  wsInstance.register(FastifyWebsocket, {
    options: {
      verifyClient(info, next) {
        const req = info.req as MyIncomingMessage;
        if (req?.greatest?.error) {
          next(false, 1, req.greatest.error);
        } else next(true);
      },
    },
  });

  wsInstance.get<{
    Params: TestParams,
  }>('/tests/:testShortId', {
    schema: {
      params: testParamsSchema,
      tags: ['websocket'],
    },
    websocket: true,
    async preHandler(request) {
      const req = request.raw as MyIncomingMessage;
      req.greatest = req.greatest ?? {};
      try {
        req.greatest.user = await requireAuthentication(request, dbManager, true);
        req.greatest.test = await requireTest(request.params.testShortId, req.greatest.user);
      } catch (error) {
        wsInstance.log.error(error);
        if (error instanceof Error) req.greatest.error = error.toString();
        else req.greatest.error = 'Unknown error';
      }
    },
  }, async (connection: SocketStream, request: FastifyRequest) => {
    const req = request.raw as MyIncomingMessage;
    if (req.greatest?.user === undefined || req.greatest.test === undefined) {
      connection.socket.close();
      return;
    }
    const { user, test } = req.greatest;
    connection.socket.send(`witaj ${user.email}`);
    connection.socket.send(test.name);
  });
}
