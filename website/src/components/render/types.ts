export interface RenderVariantOpen {
  type: 'open';
  content: string;
}

export interface RenderVariantQuiz {
  type: 'quiz';
  content: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

export type RenderVariant = RenderVariantOpen | RenderVariantQuiz;

export interface QuestionIdElement {
  type: 'question',
  questionSetShortId: string;
  questionShortId: string;
  variants: string[];
}

export type PageIdElement = QuestionIdElement;

interface QuestionElementBase {
  type: 'question';
  number: number;
  maxPoints: number;
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
