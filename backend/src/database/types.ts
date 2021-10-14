import { ObjectId, WithoutId } from 'mongodb';

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

export interface DbQuestionSet {
  _id: ObjectId;
  shortId: string;
  ownerId: ObjectId;
  name: string;
}

export type Conditional<Switch extends boolean, T extends {}> =
  Switch extends true ? T : {};

export type DbQuestionBase<WithId extends boolean> = Conditional<WithId, {
  _id: ObjectId;
  shortId: string;
  questionSetId: ObjectId;
}> & {
  maxPoints: number;
  type: string;
};

export type DbQuestionVariantBase<WithId extends boolean> = Conditional<WithId, {
  shortId: string;
}>;

export type DbQuestionQuiz<WithId extends boolean> = DbQuestionBase<WithId> & {
  type: 'quiz';
  variants: DbQuestionVariantQuiz<WithId>[];
};

export type DbQuestionVariantQuiz<WithId extends boolean> = DbQuestionVariantBase<WithId> & {
  content: string;
  correctAnswer: string;
  incorrectAnswers: string[];
};

export type DbQuestionOpen<WithId extends boolean> = DbQuestionBase<WithId> & {
  type: 'open';
  variants: DbQuestionVariantOpen<WithId>[];
};

export type DbQuestionVariantOpen<WithId extends boolean> = DbQuestionVariantBase<WithId> & {
  content: string;
};

export type DbQuestion<WithId extends boolean> = DbQuestionOpen<WithId> | DbQuestionQuiz<WithId>;

export type DbQuestionWithoutMongodbId =
  WithoutId<DbQuestionOpen<true>> | WithoutId<DbQuestionQuiz<true>>;

export interface DbTest {
  _id: ObjectId;
  shortId: string;
  name: string;
  ownerId: ObjectId;
  createdOn: Date,
  questions: DbQuestion<false>[];
}

export interface DbSheet {
  _id: ObjectId;
  shortId: string;
  testId: ObjectId;
  qrCodeId: string;
  questions: {
    variant: number;
    points: number | null;
  }[];
  phrase: string;
  generated: {
    pages: number;
  } | null;
  student: string;
}

export interface DbScanDetection {
  sheetId: ObjectId,
  page: number;
}

export interface DbScan {
  _id: ObjectId;
  shortId: string;
  testId: ObjectId;
  sheet: {
    id: ObjectId,
    page: number | null,
  } | null;
  otherTests: ObjectId[],
  detections: DbScanDetection[];
  uploadedOn: Date;
}
