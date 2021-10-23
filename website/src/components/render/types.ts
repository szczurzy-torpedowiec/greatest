export interface RenderVariantOpen {
  type: 'open';
  content: string;
  shortId: string;
}

export interface RenderVariantQuiz {
  type: 'quiz';
  content: string;
  answers: string[];
  shortId: string;
}

export type RenderVariant = RenderVariantOpen | RenderVariantQuiz;

export interface QuestionIdElement {
  type: 'question',
  questionSetShortId: string;
  questionShortId: string;
  variants: string[];
  variant: number;
}

export type PageIdElement = QuestionIdElement;

interface QuestionElementBase {
  key: string;
  number: number;
  maxPoints: number;
  idElement: QuestionIdElement;
}

export interface QuestionElementOpen extends QuestionElementBase {
  questionType: 'open';
  variants: RenderVariantOpen[];
}

export interface QuestionElementQuiz extends QuestionElementBase {
  questionType: 'quiz';
  variants: RenderVariantQuiz[];
}

export type PageElement = QuestionElementOpen | QuestionElementQuiz;
