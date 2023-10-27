import request from 'sync-request-curl';
import config from './config.json';
import { requestAdminRegister } from './auth_2.test';
import {
  requestClear,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
} from './library/route_testing_functions';
import { QuestionBody, TokenString } from './library/interfaces';
import { ErrorObjectWithCode } from './quiz';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

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

interface CreateQuizQuestionReturn {
  createQuizQuestionResponse: QuestionId;
}

interface RequestDeleteQuizQuestionReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

interface requestCreateQuestionReturn {
  statusCode?: number;
  bodyString: CreateQuizQuestionReturn | ErrorObjectWithCode;
}

function requestCreateQuestion(
  token: string,
  question: QuestionBody,
  quizId: number
): requestCreateQuestionReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token: token,
        questionBody: {
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers as QuestionBody['answers'],
        },
      },
    }
  );
  return {
    bodyString: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
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
    ).bodyString as CreateQuizQuestionReturn;
    requestDeleteQuizQuestion(
      testToken,
      QuizOne.quizId,
      questionOne.createQuizQuestionResponse.questionId
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
    ).bodyString as CreateQuizQuestionReturn;
    const invalidQuizId = requestDeleteQuizQuestion(
      testToken,
      -1 * (QuizOne.quizId + 1531),
      questionOne.createQuizQuestionResponse.questionId
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
    ).bodyString as CreateQuizQuestionReturn;
    const invalidQuestionId = requestDeleteQuizQuestion(
      testToken,
      QuizOne.quizId,
      -1 * (1531 + questionOne.createQuizQuestionResponse.questionId)
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
    ).bodyString as CreateQuizQuestionReturn;
    const invalidToken = requestDeleteQuizQuestion(
      'invalid',
      QuizOne.quizId,
      questionOne.createQuizQuestionResponse.questionId
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
    ).bodyString as CreateQuizQuestionReturn;
    const emptyToken = requestDeleteQuizQuestion(
      '',
      -1 * QuizOne.quizId,
      questionOne.createQuizQuestionResponse.questionId
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
    ).bodyString as CreateQuizQuestionReturn;
    const quizIdNotReferToUser1 = requestDeleteQuizQuestion(
      testToken2,
      JackQuiz.quizId,
      questionOne.createQuizQuestionResponse.questionId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});
