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

export interface DbQuestionSet {
  _id: ObjectId;
  shortId: string;
  ownerId: ObjectId;
  name: string;
}

export interface DbQuestionBase {
  _id: ObjectId;
  shortId: string;
  questionSetId: ObjectId;
  maxPoints: number;
  type: string;
  variants: unknown[],
}

export interface DbQuestionQuiz extends DbQuestionBase {
  type: 'quiz';
  variants: DbQuestionVariantQuiz[]
}

export interface DbQuestionVariantQuiz {
  shortId: string;
  content: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

export interface DbQuestionOpen extends DbQuestionBase {
  type: 'open';
  variants: DbQuestionVariantOpen[]
}

export interface DbQuestionVariantOpen {
  shortId: string;
  content: string;
}

export type DbQuestion = DbQuestionQuiz | DbQuestionOpen;
