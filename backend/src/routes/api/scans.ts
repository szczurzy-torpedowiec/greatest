import { FastifyInstance } from 'fastify';
import {
  ListScansReply,
  listScansReplySchema,
  PatchScanBody, patchScanBodySchema, PatchScanReply, patchScanReplySchema,
  Scan, ScanParams, scanParamsSchema,
  TestParams,
  testParamsSchema,
  UploadScanBody,
  uploadScanBodySchema, UploadScanFiles,
  uploadScanFiles,
  UploadScanReply,
  uploadScanReplySchema, uploadScanSupportedTypes,
} from 'greatest-api-schemas';
import { nanoid } from 'nanoid';
import { ObjectId } from 'mongodb';
import { DbManager } from '../../database/database';
import {
  getSecurity,
  requireAuthentication, requireTest,
} from '../../guards';
import { scanImage } from '../../scanner';
import { DbTest } from '../../database/types';
import { config } from '../../config';
import { filterNotNull, getOnly } from '../../utils';
import { WebsocketBus } from '../../websocket-bus';
import { mapScan, mapScanOtherTest } from '../../mappers';

export function registerScans(
  apiInstance: FastifyInstance,
  dbManager: DbManager,
  websocketBus: WebsocketBus,
) {
  apiInstance.get<{
    Params: TestParams,
    Reply: ListScansReply,
  }>('/tests/:testShortId/scans', {
    schema: {
      params: testParamsSchema,
      response: {
        200: listScansReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);

    const scans = await Promise.all(
      await dbManager.scansCollection.find({
        testId: test._id,
      })
        .map((scan) => mapScan(scan, user, dbManager))
        .toArray(),
    );
    return {
      scans,
    };
  });

  apiInstance.post<{
    Body: UploadScanBody,
    Params: TestParams,
    Reply: UploadScanReply,
    Files: UploadScanFiles,
  }>('/tests/:testShortId/scans/upload', {
    schema: {
      consumes: ['multipart/form-data'],
      files: uploadScanFiles,
      body: uploadScanBodySchema,
      params: testParamsSchema,
      response: {
        200: uploadScanReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const { file } = request.files;
    if (!file) throw apiInstance.httpErrors.badRequest('Missing "file"');
    if (!uploadScanSupportedTypes.includes(file.mimeType)) {
      throw apiInstance.httpErrors.unsupportedMediaType(
        `Unsupported media type. Supported formats: ${uploadScanSupportedTypes.map((x) => `"${x}"`).join(', ')}`,
      );
    }

    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);

    const scanResult = await scanImage(file);

    const qrRegex = /^\/s\/([A-z0-9\-_]{6})\/(\d)+$/;
    const otherTests: DbTest[] = [];
    const detections = filterNotNull(await Promise.all(scanResult.codes.map(
      async (code) => {
        try {
          const url = new URL(code);
          if (url.origin !== config.qrOrigin) apiInstance.log.warn(`Invalid QR code origin: "${url.origin}", expected ${config.qrOrigin}`);
          const result = qrRegex.exec(url.pathname);
          if (result === null) {
            apiInstance.log.warn(`Cannot parse QR code path: ${url.pathname}`);
            return null;
          }
          const qrCodeId = result[1];
          const sheet = await dbManager.sheetsCollection.findOne({
            qrCodeId,
          });
          if (sheet === null) {
            apiInstance.log.warn('Sheet not found');
            return null;
          }
          if (!sheet.testId.equals(test._id)) {
            otherTests.push(test);
            apiInstance.log.warn('Sheet belongs to another test');
            return null;
          }
          return {
            sheet,
            page: parseInt(result[2], 10),
          };
        } catch (error) {
          apiInstance.log.warn(error);
          apiInstance.log.warn(`Cannot parse QR code: "${code}"`);
          return null;
        }
      },
    )));
    const shortId = nanoid(10);
    const uploadedOn = new Date();
    const pickedDetection = getOnly(detections);
    await dbManager.scansCollection.insertOne({
      testId: test._id,
      detections: detections.map((detection) => ({
        page: detection.page,
        sheetId: detection.sheet._id,
      })),
      shortId,
      otherTests: otherTests.map((otherTest) => otherTest._id),
      uploadedOn,
      sheetId: pickedDetection?.sheet._id ?? null,
    });

    const scan: Scan = {
      shortId,
      sheetShortId: pickedDetection?.sheet?.shortId ?? null,
      uploadedOn: uploadedOn.toISOString(),
      otherTests: otherTests.map((otherTest) => mapScanOtherTest(otherTest, user)),
      detections: detections.map((detection) => ({
        sheetShortId: detection.sheet.shortId,
        page: detection.page,
      })),
    };
    await websocketBus.getTest(test._id).scanCreateBody.emit(scan, request.body.requestId);
    return scan;
  });

  apiInstance.patch<{
    Body: PatchScanBody,
    Params: ScanParams,
    Reply: PatchScanReply,
  }>('/tests/:testShortId/scans/:scanShortId', {
    schema: {
      body: patchScanBodySchema,
      params: scanParamsSchema,
      response: {
        200: patchScanReplySchema,
      },
      security: getSecurity(),
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const test = await requireTest(request, dbManager, user, request.params.testShortId);

    let sheetId: ObjectId | null | undefined;
    if (request.body.sheetShortId === null) sheetId = null;
    else if (request.body.sheetShortId !== undefined) {
      const sheet = await dbManager.sheetsCollection.findOne({
        testId: test._id,
        shortId: request.body.sheetShortId,
      });
      if (sheet === null) throw apiInstance.httpErrors.notFound('Sheet not found');
      sheetId = sheet._id;
    }

    const newScan = await dbManager.scansCollection.findOneAndUpdate({
      testId: test._id,
      shortId: request.params.scanShortId,
    }, {
      $set: {
        sheetId,
      },
    }, {
      returnDocument: 'after',
    });
    if (newScan.value === null) return apiInstance.httpErrors.notFound('Scan not found');

    await websocketBus.getTest(test._id).scanChange.emit(newScan.value, request.body.requestId);
    return {};
  });
}
