import { ObjectId } from 'mongodb';

export interface DbUser {
  _id: ObjectId;
  googleId: string;
  googleRefreshToken: string;
  email: string;
}

export interface DbApiToken {
  _id: ObjectId,
  tokenId: string;
  tokenHash: string;
  ownerId: ObjectId;
  name: string;
  createdOn: Date;
}
