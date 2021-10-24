export interface RenderVariantOpen {
  type: 'open';
  content: string;
}

export interface RenderVariantQuiz {
  type: 'quiz';
  content: string;
  answers: string[];
}

export type RenderVariant = RenderVariantOpen | RenderVariantQuiz;
