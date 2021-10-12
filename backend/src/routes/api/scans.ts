import { FastifyInstance } from 'fastify';
import {
  Scan,
  TestParams,
  testParamsSchema,
  UploadScanBody,
  uploadScanBodySchema, UploadScanFiles,
  uploadScanFiles,
  UploadScanReply,
  uploadScanReplySchema, uploadScanSupportedTypes,
} from 'greatest-api-schemas';
import { nanoid } from 'nanoid';
import { DbManager } from '../../database/database';
import { requireAuthentication, requireTest } from '../../guards';
import { scanImage } from '../../scanner';
import { DbTest } from '../../database/types';
import { config } from '../../config';
import { filterNotNull, getOnly } from '../../utils';
import { WebsocketBus } from '../../websocket-bus';
import { mapScanOtherTest } from '../../mappers';

export function registerScans(
  apiInstance: FastifyInstance,
  dbManager: DbManager,
  websocketBus: WebsocketBus,
) {
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
      // TODO: Add security schema field in all endpoints
      security: [
        { apiTokenHeader: [] },
        { sessionCookie: [] },
      ],
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
}
