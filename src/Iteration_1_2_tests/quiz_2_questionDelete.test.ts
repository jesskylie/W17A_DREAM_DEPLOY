import request from 'sync-request-curl';
import config from '../config.json';

import {
  requestClear,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminRegister,
  requestCreateQuestion,
} from '../library/route_testing_functions';
import { QuestionBody, TokenString } from '../library/interfaces';

import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from '../library/constants';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

interface ErrorObject {
  error: string;
}

interface QuizId {
  quizId: number;
}

interface QuestionId {
  questionId: number;
}

interface RequestDeleteQuizQuestionReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

export { requestCreateQuestion };
const requestDeleteQuizQuestion = (
  token: string,
  quizId: number,
  questionId: number
): RequestDeleteQuizQuestionReturn => {
  const res = request(
    'DELETE',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
    {
      qs: { quizId, token, questionId },
    }
  );
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

describe('deleteQuizQuestion testing', () => {
  test('StatusCode 200: Valid input', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;

    requestDeleteQuizQuestion(
      testToken,
      QuizOne.quizId,
      questionOne.questionId
    );
    const quiz1Info = requestAdminQuizInfo(testToken, QuizOne.quizId);
    expect(quiz1Info.bodyString).toStrictEqual({
      quizId: QuizOne.quizId,
      name: 'Quiz One',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my first quiz',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
  });

  test('Error 400: QuizId does not refer to a valid quiz', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const invalidQuizId = requestDeleteQuizQuestion(
      testToken,
      -1 * (QuizOne.quizId + 1531),
      questionOne.questionId
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: QuestionId does not refer to a valid question with this quiz', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const invalidQuestionId = requestDeleteQuizQuestion(
      testToken,
      QuizOne.quizId,
      -1 * (1531 + questionOne.questionId)
    );
    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuestionId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const invalidToken = requestDeleteQuizQuestion(
      'invalid',
      QuizOne.quizId,
      questionOne.questionId
    );
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const emptyToken = requestDeleteQuizQuestion(
      '',
      -1 * QuizOne.quizId,
      questionOne.questionId
    );
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Valid token but user is not an owner of this quiz', () => {
    requestClear();
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;

    const testToken = returnTokenObj.token;
    // create user 2
    const returnTokenObj2 = requestAdminRegister(
      'tony@hotmail.com',
      'ab123456b',
      'Tony',
      'Stark'
    ).body as TokenString;

    const testToken2 = returnTokenObj2.token;

    // Create quiz using jack@hotmail.com token
    const JackQuiz = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'This a quiz by Jack'
    ).bodyString as QuizId;

    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      JackQuiz.quizId
    ).bodyString as QuestionId;
    const quizIdNotReferToUser1 = requestDeleteQuizQuestion(
      testToken2,
      JackQuiz.quizId,
      questionOne.questionId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});
