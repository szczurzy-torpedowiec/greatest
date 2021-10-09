import path from 'path';
import { nanoid } from 'nanoid';
import fse from 'fs-extra';
import { FastifyInstance } from 'fastify';
import sharp from 'sharp';
import {
  FolderParams,
  folderParamsSchema,
  UploadImageBody,
  uploadImageBodySchema,
  UploadImageReply,
  uploadImageReplySchema,
} from 'greatest-api-schemas';
import { requireAuthentication } from '../../guards';
import { mapObject } from '../../utils';
import { hasRole } from '../../rules';
import { config } from '../../config';
import analyseImage from '../../analyse';
import { DbManager } from '../../database/database';
import { DbImageBoard } from '../../database/types';

export function registerImageUpload(apiInstance: FastifyInstance, dbManager: DbManager) {
  apiInstance.post<{
    Body: UploadImageBody,
    Params: FolderParams,
    Reply: UploadImageReply,
    Files: ['file'],
  }>('/folders/:folderShortId/upload-image', {
    schema: {
      consumes: ['multipart/form-data'],
      files: ['file'],
      body: uploadImageBodySchema,
      params: folderParamsSchema,
      response: {
        200: uploadImageReplySchema,
      },
      security: [
        { apiTokenHeader: [] },
        { sessionCookie: [] },
      ],
    },
  }, async (request) => {
    const user = await requireAuthentication(request, dbManager, true);
    const { file } = request.files;
    if (!file) throw apiInstance.httpErrors.badRequest('Missing "file"');
    const supportedTypes = ['image/bmp', 'image/jpeg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(file.mimeType)) throw apiInstance.httpErrors.unsupportedMediaType(`Unsupported media type. Supported formats: ${supportedTypes.map((x) => `"${x}"`).join(', ')}`);
    const folder = await dbManager.foldersCollection.findOne({
      shortId: request.params.folderShortId,
    });
    if (folder === null) throw apiInstance.httpErrors.notFound('Folder not found');
    if (!hasRole(folder, user, 'editor')) throw apiInstance.httpErrors.forbidden();

    let folderPath: string;
    do {
      folderPath = path.join(config.storagePath, `${nanoid(12)}`);
      // eslint-disable-next-line no-await-in-loop
    } while (await fse.pathExists(folderPath));
    await fse.ensureDir(folderPath);
    const rawPath = path.join(folderPath, `raw${path.extname(file.filename)}`);
    const fullPath = path.join(folderPath, 'full.webp');
    const getTransform = (name: string, width: number, height: number) => {
      const filePath = path.join(folderPath, `${name}.webp`);
      return {
        filePath,
        execute: async () => sharp(file.data)
          .rotate()
          .resize({
            width,
            height,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toFile(filePath),
      };
    };
    const transforms: Record<'small' | 'medium' | 'large', ReturnType<typeof getTransform>> = {
      small: getTransform('small', 426, 240),
      medium: getTransform('medium', 854, 480),
      large: getTransform('large', 1920, 1080),
    };

    let boards: DbImageBoard[] | null = null;
    const loadBoards = async () => {
      try {
        boards = await analyseImage(file, dbManager, [[0, 1, 2, 3]]);
      } catch (error) { apiInstance.log.error(error); }
    };
    await Promise.all([
      fse.writeFile(rawPath, file.data),
      loadBoards(),
      sharp(file.data).rotate().toFile(fullPath),
      Promise.all(Object.values(transforms).map((x) => x.execute())),
    ]);

    let shortId: string;
    do {
      shortId = nanoid(10);
      // eslint-disable-next-line no-await-in-loop
    } while ((await dbManager.imagesCollection.findOne({ shortId })) !== null);
    const uploadedOn = new Date();
    await dbManager.imagesCollection.insertOne({
      shortId,
      boards,
      capturedOnDay: request.body.capturedOn,
      uploadedOn,
      folderId: folder._id,
      uploaderId: user._id,
      rawFile: {
        path: rawPath,
        mimeType: file.mimeType,
      },
      compressedFilePaths: {
        full: fullPath,
        ...mapObject(transforms, (x) => x.filePath),
      },
    });
    return {
      shortId,
      capturedOn: request.body.capturedOn,
      uploadedOn: uploadedOn.toISOString(),
    };
  });
}
