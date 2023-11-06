// Do not delete this file _
import request from 'sync-request-curl';
import config from '../config.json';

import { RESPONSE_ERROR_401, WAIT_TIME } from '../library/constants';
import {
  requestClear,
  requestAdminQuizCreate,
} from '../library/route_testing_functions';

import { TokenString } from '../library/interfaces';

// assuming there are these functions in auth_2.test.ts (name could be change after finish writing auth_2.test.ts)
import { Quizzes } from '../dataStore';

function requestAdminRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
) {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });
  return JSON.parse(res.body.toString());
}

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

interface QuizId {
  quizId: number;
}

interface requestAdminQuizListReturn {
  statusCode?: number;
  bodyString: Quizzes[] | ErrorObject;
}

interface requestAdminQuizRemoveReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

// interfaces used throughout file - END

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

const requestAdminQuizRemove = (
  token: string,
  quizid: number
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    qs: { quizid, token },
    timeout: WAIT_TIME,
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

// ***********************************************************************************

// adminTrashQuizList - testing start

const requestAdminTrashQuizList = (
  token: string
): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

describe('adminTrashQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // Create quiz 1
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;

    // create quiz 2
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;

    // should wait here
    // Send QuizOne to trash
    requestAdminQuizRemove(testToken, QuizOne.quizId);

    // print out quiz in trash
    const TrashQuizPrint = requestAdminTrashQuizList(testToken);

    expect(TrashQuizPrint.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
      ],
    });
    requestAdminQuizRemove(testToken, QuizTwo.quizId);
    const TrashQuizPrint2 = requestAdminTrashQuizList(testToken);
    expect(TrashQuizPrint2.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
        {
          quizId: QuizTwo.quizId,
          name: 'Quiz Two',
        },
      ],
    });
  });

  test('Error 401: invalid token', () => {
    const invalidToken = requestAdminTrashQuizList('invalid');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: empty token', () => {
    const invalidToken = requestAdminTrashQuizList('');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});
