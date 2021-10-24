import { FastifyInstance } from 'fastify';
import {
  binarySchema,
  GetSheetQrCodeParams,
  getSheetQrCodeParamsSchema,
} from 'greatest-api-schemas';
import { createStream, OutputType, SymbologyType } from 'symbology';
import { config } from '../../config';

export function registerQr(apiInstance: FastifyInstance) {
  apiInstance.get<{
    Params: GetSheetQrCodeParams,
  }>('/qr/sheet/:qrCodeId/:page', {
    schema: {
      params: getSheetQrCodeParamsSchema,
      response: {
        200: binarySchema,
      },
      produces: ['image/svg+xml'],
    },
  }, async (request, reply) => {
    const url = new URL(`/s/${request.params.qrCodeId}/${request.params.page}`, config.qrOrigin);
    const stream = await createStream({
      symbology: SymbologyType.AZTEC,
      showHumanReadableText: false,
    }, url.toString(), OutputType.SVG);
    if (stream.data === undefined) throw new Error(stream.message);
    reply.type('image/svg+xml').send(stream.data);
  });
}
