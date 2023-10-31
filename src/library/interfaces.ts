import { Quizzes } from '../dataStore';

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

export interface NewQuestionId {
  newQuestionId: number;
}

export interface ErrorObject {
  error: string;
}

export interface QuizId {
  quizId: number;
}

export interface requestAdminQuizCreateReturn {
  statusCode?: number;
  bodyString: QuizId | ErrorObject;
}

export interface requestAdminQuizListReturn {
  statusCode?: number;
  bodyString: Quizzes[] | ErrorObject;
}

export interface requestAdminQuizInfoReturn {
  statusCode?: number;
  bodyString: Quizzes | ErrorObject;
}

export interface requestCreateQuestionReturn {
  statusCode?: number;
  bodyString: QuestionId | ErrorObjectWithCode;
}
