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
  thumbnailUrl: string;
}

export interface GetSessionStatusReturnObj {
  state: string;
  atQuestion: number;
  players: string[];
  metadata: Quizzes;
}

export interface ErrorObjectWithCode {
  error: string;
  errorCode: number;
}

export interface TransferQuizReturn {
  transferQuizResponse: Record<string, never> | ErrorObjectWithCode;
}

export interface TransferQuizServerReturn {
  bodyString: TransferQuizReturn;
  statusCode: number;
}

export interface AuthUserId {
  authUserId: number;
}

export interface TokenString {
  token: string;
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

export interface requestAdminRegisterReturn {
  token: string;
}

export interface requestAdminAuthLoginReturn {
  statusCode?: number;
  bodyString: TokenString | ErrorObject;
}

export interface requestAdminQuizRemoveReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

export interface requestAdminTrashQuizRestoreReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

export interface AdminQuizCreateReturn {
  quizId: number;
}

export interface HTTPResponse {
  statusCode: number;
}

export interface AdminQuizCreateReturnCombined {
  resBody: AdminQuizCreateReturn | ErrorObjectWithCode;
}

export interface RequestDeleteQuizQuestionReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

export interface RequestGenericReturn {
  statusCode: number;
  bodyString: ErrorObject | Record<string, never>;
}

export interface UserInfo {
  user: {
    authUserId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

export interface RequestUserDetailsReturn {
  bodyString: UserInfo | ErrorObject;
  statusCode: number;
}

interface AdminUserDetailUpdateReturn {
  detailsUpdateResponse: Record<string, never> | ErrorObjectWithCode;
}

export interface RequestAdminDetailsUpdateServerReturn {
  bodyString: AdminUserDetailUpdateReturn;
  statusCode: number;
}

export interface MessageBody {
  messageBody: string;
}

export interface ImageUrlReturn {
  imgUrl: string;
}

export interface PlayerId {
  playerId: number;
}

export interface PlayerStatus {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

export interface PlayerWithScore {
  name: string;
  score: number;
}

interface QuestionResult {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export interface SessionFinalResult {
  usersRankedByScore: PlayerWithScore[];
  questionResults: QuestionResult[];
}
