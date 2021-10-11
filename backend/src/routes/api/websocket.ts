import { FastifyInstance, FastifyRequest } from 'fastify';
import FastifyWebsocket, { SocketStream } from 'fastify-websocket';
import { IncomingMessage } from 'http';
import { TestParams, testParamsSchema, TestWebsocketMessage } from 'greatest-api-schemas';
import { WithoutId } from 'mongodb';
import { DbManager } from '../../database/database';
import { requireAuthentication } from '../../guards';
import { DbSheet, DbTest, DbUser } from '../../database/types';
import { WebsocketBus } from '../../websocket-bus';
import { mapSheet } from '../../mappers';

interface MyIncomingMessage extends IncomingMessage {
  greatest?: {
    error?: string;
    user?: DbUser;
    test?: DbTest;
  };
}

export interface WebsocketPluginOptions {
  dbManager: DbManager;
  websocketBus: WebsocketBus,
}
export async function WebsocketPlugin(
  wsInstance: FastifyInstance,
  { dbManager, websocketBus }: WebsocketPluginOptions,
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
    const sendMessage = (message: TestWebsocketMessage) => {
      connection.socket.send(JSON.stringify(message));
    };
    const { test } = req.greatest;
    const onSheetChange = (sheet: WithoutId<DbSheet>) => {
      if (!sheet.testId.equals(test._id)) return;
      sendMessage({
        type: 'change',
        sheet: mapSheet(sheet),
      });
    };
    const onSheetCreate = (sheet: WithoutId<DbSheet>) => {
      if (!sheet.testId.equals(test._id)) return;
      sendMessage({
        type: 'create',
        sheet: mapSheet(sheet),
      });
    };
    websocketBus.sheetChange.on(onSheetChange);
    websocketBus.sheetCreate.on(onSheetCreate);

    connection.socket.on('close', () => {
      websocketBus.sheetChange.off(onSheetChange);
      websocketBus.sheetCreate.off(onSheetCreate);
    });
  });
}
