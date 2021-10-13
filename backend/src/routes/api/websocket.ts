import { FastifyInstance, FastifyRequest } from 'fastify';
import FastifyWebsocket, { SocketStream } from 'fastify-websocket';
import { IncomingMessage } from 'http';
import {
  Scan, TestParams, testParamsSchema, TestWebsocketMessage,
} from 'greatest-api-schemas';
import { WithoutId } from 'mongodb';
import { DbManager } from '../../database/database';
import { getSecurity, requireAuthentication } from '../../guards';
import {
  DbScan, DbSheet, DbTest, DbUser,
} from '../../database/types';
import { WebsocketBus } from '../../websocket-bus';
import { mapScan, mapSheet } from '../../mappers';
import { OffFunction } from '../../utils';

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
          next(false, 1008, req.greatest.error);
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
      security: getSecurity(),
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
    const sendMessage = (message: TestWebsocketMessage) => {
      connection.socket.send(JSON.stringify(message, null, 2));
    };
    const offList: OffFunction[] = [];
    offList.push(
      websocketBus.getTest(test._id).sheetChange.on(
        (sheet: WithoutId<DbSheet>, causingRequestId: string) => {
          sendMessage({
            type: 'sheet-change',
            sheet: mapSheet(sheet),
            causingRequestId,
          });
        },
      ),
      websocketBus.getTest(test._id).sheetCreate.on(
        (sheet: WithoutId<DbSheet>, causingRequestId: string) => {
          sendMessage({
            type: 'sheet-create',
            sheet: mapSheet(sheet),
            causingRequestId,
          });
        },
      ),
      websocketBus.getTest(test._id).scanChange.on(
        async (scan: WithoutId<DbScan>, causingRequestId: string) => {
          sendMessage({
            type: 'scan-change',
            scan: await mapScan(scan, user, dbManager),
            causingRequestId,
          });
        },
      ),
      websocketBus.getTest(test._id).scanCreateBody.on(
        async (scan: Scan, causingRequestId: string) => {
          sendMessage({
            type: 'scan-create',
            scan,
            causingRequestId,
          });
        },
      ),
    );

    connection.socket.on('close', () => {
      offList.forEach((off) => off());
    });
  });
}
