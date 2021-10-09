import {
  Collection, Db, MongoClient,
} from 'mongodb';
import {
  DbApiToken, DbUser,
} from './types';
import { config } from '../config';

export class DbManager {
  private client: MongoClient;

  private db: Db;

  public usersCollection: Collection<DbUser>;

  public apiTokensCollection: Collection<DbApiToken>;

  constructor(client: MongoClient) {
    this.client = client;
    this.db = this.client.db();
    this.usersCollection = this.db.collection<DbUser>('users');
    this.apiTokensCollection = this.db.collection<DbApiToken>('api-tokens');
  }

  async init() {
    await this.usersCollection.createIndex({ googleId: 1 }, { unique: true });

    await this.apiTokensCollection.createIndex({ tokenId: 1 }, { unique: true });
    await this.apiTokensCollection.createIndex({ ownerId: 1 });
  }
}

export async function connectDb() {
  const client = new MongoClient(config.mongodbUrl);
  await client.connect();
  const manager = new DbManager(client);
  await manager.init();
  return manager;
}
