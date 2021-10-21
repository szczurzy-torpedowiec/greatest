export interface RenderVariantOpen {
  type: 'open';
  content: string;
}

export interface RenderVariantQuiz {
  type: 'quiz';
  content: string;
  correctAnswer: string;
  incorrectAnswers: string;
}

export type RenderVariant = RenderVariantOpen | RenderVariantQuiz;
