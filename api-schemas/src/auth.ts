import { Static, Type } from '@sinclair/typebox';

export const demoSignInBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});
export type DemoSignInBody = Static<typeof demoSignInBodySchema>;

export const createDemoUserReplySchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
  password: Type.String(),
});
export type CreateDemoUserReply = Static<typeof createDemoUserReplySchema>;
