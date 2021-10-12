import { FastifyInstance } from 'fastify';
import {
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
import { requireAuthentication, requireTest } from '../../guards';
import { scanImage } from '../../scanner';
import { DbScanDetection } from '../../database/types';
import { config } from '../../config';
import { filterNotNull, getOnly } from '../../utils';

export function registerScans(apiInstance: FastifyInstance, dbManager: DbManager) {
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
    const otherTests: ObjectId[] = [];
    const detections = filterNotNull(await Promise.all(scanResult.codes.map(
      async (code): Promise<DbScanDetection | null> => {
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
            otherTests.push(test._id);
            apiInstance.log.warn('Sheet belongs to another test');
            return null;
          }
          return {
            sheetId: sheet._id,
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
    await dbManager.scansCollection.insertOne({
      testId: test._id,
      detections,
      shortId,
      otherTests,
      uploadedOn: new Date(),
      sheetId: getOnly(detections)?.sheetId ?? null,
    });
    return {
      shortId,
    };
  });
}
