import {
  Collection, Db, MongoClient, WithSessionCallback, WithTransactionCallback,
} from 'mongodb';
import {
  DbApiToken, DbQuestion, DbQuestionSet, DbScan, DbSheet, DbTest, DbUser,
} from './types';
import { config } from '../config';

export class DbManager {
  private client: MongoClient;

  private db: Db;

  public usersCollection: Collection<DbUser>;

  public apiTokensCollection: Collection<DbApiToken>;

  public questionSetsCollection: Collection<DbQuestionSet>;

  public questionsCollection: Collection<DbQuestion<true>>;

  public testsCollection: Collection<DbTest>;

  public sheetsCollection: Collection<DbSheet>;

  public scansCollection: Collection<DbScan>;

  constructor(client: MongoClient) {
    this.client = client;
    this.db = this.client.db();
    this.usersCollection = this.db.collection<DbUser>('users');
    this.apiTokensCollection = this.db.collection<DbApiToken>('api-tokens');
    this.questionSetsCollection = this.db.collection<DbQuestionSet>('question-sets');
    this.questionsCollection = this.db.collection<DbQuestion<true>>('questions');
    this.testsCollection = this.db.collection<DbTest>('tests');
    this.sheetsCollection = this.db.collection<DbSheet>('sheets');
    this.scansCollection = this.db.collection<DbScan>('scans');
  }

  async init() {
    await this.usersCollection.createIndex({ googleId: 1 }, {
      unique: true, partialFilterExpression: { type: { $eq: 'google' } },
    });
    await this.usersCollection.createIndex({ email: 1 }, { unique: true });

    await this.apiTokensCollection.createIndex({ tokenId: 1 }, { unique: true });
    await this.apiTokensCollection.createIndex({ ownerId: 1 });

    await this.questionSetsCollection.createIndex({ ownerId: 1 });
    await this.questionSetsCollection.createIndex({ shortId: 1 }, { unique: true });

    await this.questionsCollection.createIndex({ questionSetId: 1 });
    await this.questionsCollection.createIndex({ questionSetId: 1, shortId: 1 }, { unique: true });

    await this.testsCollection.createIndex({ ownerId: 1 });
    await this.testsCollection.createIndex({ shortId: 1 }, { unique: true });

    await this.sheetsCollection.createIndex({ testId: 1 });
    await this.sheetsCollection.createIndex({ testId: 1, shortId: 1 }, { unique: true });
    await this.sheetsCollection.createIndex({ qrCodeId: 1 }, { unique: true });

    await this.scansCollection.createIndex({ testId: 1 });
    await this.scansCollection.createIndex({ testId: 1, shortId: 1 }, { unique: true });
    await this.scansCollection.createIndex({ testId: 1, 'sheet.id': 1 });
  }

  withSession(callback: WithSessionCallback) {
    return this.client.withSession(callback);
  }

  withTransaction(callback: WithTransactionCallback) {
    return this.client.withSession(
      (session) => session.withTransaction(callback),
    );
  }
}

export async function connectDb() {
  const client = new MongoClient(config.mongodbUrl, {
    ignoreUndefined: true,
  });
  await client.connect();
  const manager = new DbManager(client);
  await manager.init();
  return manager;
}
