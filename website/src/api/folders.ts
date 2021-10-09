import ky from 'ky-universal';
import {
  CreateFolderBody, CreateFolderReply,
  FolderAncestorsReply, FolderImagesReply, FolderInfoReply,
  ListUserFoldersReply,
  RenameFolderBody,
} from 'greatest-api-schemas';

export function listUserFolders() {
  return ky.get('/api/list-user-folders').json<ListUserFoldersReply>();
}

export function createRootFolder(name: string) {
  const body: CreateFolderBody = { name };
  return ky.post('/api/create-root-folder', { json: body }).json<CreateFolderReply>();
}

export function createSubfolder(name: string, parentShortId: string) {
  const body: CreateFolderBody = { name };
  return ky.post(`/api/folders/${parentShortId}/create-folder`, { json: body }).json<CreateFolderReply>();
}

export function getFolderAncestors(shortId: string) {
  return ky.get(`/api/folders/${shortId}/ancestors`).json<FolderAncestorsReply>();
}

export function getFolderInfo(shortId: string) {
  return ky.get(`/api/folders/${shortId}/info`).json<FolderInfoReply>();
}

export function getImages(shortId: string) {
  return ky.get(`/api/folders/${shortId}/images`).json<FolderImagesReply>();
}

export async function renameFolder(name: string, folderId: string) {
  const body: RenameFolderBody = { name };
  await ky.patch(`/api/folders/${folderId}/rename`, { json: body });
}
