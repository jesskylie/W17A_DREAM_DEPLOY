export interface QuestionBody {
  question: string;
  duration: number;
  points: number;
  answers: {
    answer: string;
    correct: boolean;
    colour: string;
    answerId: number;
  }[];
}

export interface AuthUserId {
  authUserId: number;
}

export interface TokenString {
  token: string;
}

export interface ErrorObjectWithCode {
  error: string;
  errorCode: number;
}

export interface QuestionId {
  questionId: number;
}

export interface CreateQuizQuestionReturn {
  createQuizQuestionResponse: QuestionId | ErrorObjectWithCode;
}
