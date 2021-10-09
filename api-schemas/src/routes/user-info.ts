import { Static, Type } from '@sinclair/typebox';
import { nullable } from '../utility';

export const viewerSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
  avatarUrl: Type.String(),
});
export type Viewer = Static<typeof viewerSchema>;
export const getViewerReplySchema = nullable(viewerSchema);
export type GetViewerReply = Static<typeof getViewerReplySchema>;
