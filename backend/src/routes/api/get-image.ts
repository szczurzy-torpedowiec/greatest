import { FastifyInstance, FastifyRequest } from 'fastify';
import fse from 'fs-extra';
import { binarySchema, ImageParams, imageParamsSchema } from 'greatest-api-schemas';
import { requireAuthentication } from '../../guards';
import { hasRole } from '../../rules';
import { DbManager } from '../../database/database';
import { DbCompressedImageSize } from '../../database/types';

export function registerImageDownload(apiInstance: FastifyInstance, dbManager: DbManager) {
  const getImage = async (request: FastifyRequest<{ Params: ImageParams }>) => {
    const user = await requireAuthentication(request, dbManager, true);
    const folder = await dbManager.foldersCollection.findOne({
      shortId: request.params.folderShortId,
    });
    if (folder === null) throw apiInstance.httpErrors.notFound('Folder not found');
    if (!hasRole(folder, user, 'viewer')) throw apiInstance.httpErrors.forbidden();
    const image = await dbManager.imagesCollection.findOne({
      shortId: request.params.imageShortId,
      folderId: folder._id,
    });
    if (image === null) throw apiInstance.httpErrors.notFound('Image not found');
    return image;
  };

  apiInstance.get<{
    Params: ImageParams,
  }>('/folders/:folderShortId/images/:imageShortId/raw', {
    schema: {
      params: imageParamsSchema,
      security: [
        { apiTokenHeader: [] },
        { sessionCookie: [] },
      ],
      produces: ['image/*'],
      response: {
        200: binarySchema,
      },
    },
  }, async (request, reply) => {
    const image = await getImage(request);
    reply.type(image.rawFile.mimeType).send(fse.createReadStream(image.rawFile.path));
  });

  const sizes: DbCompressedImageSize[] = ['full', 'small', 'medium', 'large'];
  sizes.forEach((size) => {
    apiInstance.get<{
      Params: ImageParams,
    }>(`/folders/:folderShortId/images/:imageShortId/${size}.webp`, {
      schema: {
        params: imageParamsSchema,
        security: [
          { apiTokenHeader: [] },
          { sessionCookie: [] },
        ],
        produces: ['image/webp'],
        response: {
          200: binarySchema,
        },
      },
    }, async (request, reply) => {
      const image = await getImage(request);
      reply.type('image/webp').send(fse.createReadStream(image.compressedFilePaths[size]));
    });
  });
}
