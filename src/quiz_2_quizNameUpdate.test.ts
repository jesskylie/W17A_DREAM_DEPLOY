// Do not delete this file _
import request from 'sync-request-curl';
import config from './config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  WAIT_TIME,
} from './library/constants';

import { TokenString } from './library/interfaces';

// assuming there are these functions in auth_2.test.ts (name could be change after finish writing auth_2.test.ts)
import { Quizzes } from './dataStore';
import { requestAdminQuizCreate, requestAdminQuizInfo } from './quiz_2.test';

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

const requestAdminAuthLogin = (
  email: string,
  password: string
): RequestAdminAuthLoginReturn => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password },
  });
  const bodyString = JSON.parse(res.body.toString());

  return { statusCode: res.statusCode, bodyString: bodyString };
};

// interfaces used throughout file - START

interface BodyString {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  descriptions: string;
}

interface ErrorObject {
  error: string;
}

interface QuizId {
  quizId: number;
}

interface RequestAdminAuthLoginReturn {
  statusCode?: number;
  bodyString: TokenString | ErrorObject;
}

interface RequestAdminQuizNameUpdateReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

// interfaces used throughout file - END

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

const requestClear = () => {
  const res = request('DELETE', SERVER_URL + `/v1/clear`, {
    timeout: WAIT_TIME,
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

const requestAdminQuizNameUpdate = (
  token: string,
  quizid: number,
  name: string
): RequestAdminQuizNameUpdateReturn => {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/name`, {
    json: { token, quizid, name },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

describe('Testing adminQuizNameUpdate', () => {
  test('Status Code 200: Correct input - Expect Response 200', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    const quizIdTest = QuizOne.quizId;

    const newName = 'Quiz 1531';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken,
      quizIdTest,
      newName
    );
    // test for normal response: status code 200 and empty object
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_OK_200);
    expect(testNameUpdate.bodyString).toStrictEqual({});

    // test for new quiz name
    const testNewNameChangedObj = requestAdminQuizInfo(testToken, quizIdTest);

    if ('bodyString' in testNewNameChangedObj) {
      const testBodyString = testNewNameChangedObj.bodyString as Quizzes;
      const testName = testBodyString.name;
      expect(testName).toStrictEqual(newName);
    }
  });

  test('Quiz ID does not refer to a valid quiz - Expect Error - Response Code 400', () => {
    requestClear();
    // register user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz
    requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid quizId
    const quizIdTest = -1;

    const newName = 'Quiz 1531';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 400
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Quiz Name contains invalid characters - Expect Error - Response Code 400', () => {
    requestClear();
    // register user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid quiz name
    const quizIdTest = QuizOne.quizId;

    const newName = '$$Quiz 1531&&&';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 400
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Quiz Name already in used by the current logged in user for another quiz - Expect Error - Response Code 400', () => {
    requestClear();
    // register user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid quiz name - same name as existing quizy
    // by currently logged in user
    const quizIdTest = QuizOne.quizId;

    const newName = 'Quiz 1';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 400
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Quiz Name less than 3 characters - Expect Error - Response Code 400', () => {
    requestClear();
    // register user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid quiz name - same name as existing quizy
    // by currently logged in user
    const quizIdTest = QuizOne.quizId;

    const newName = 'Qu';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 400
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Quiz Name greater than 30 characters - Expect Error - Response Code 400', () => {
    requestClear();
    // register user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid quiz name - same name as existing quizy
    // by currently logged in user
    const quizIdTest = QuizOne.quizId;

    const newName = 'This new quiz name is too long to be used';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 401
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session) - Expect Error - Response Code 401', () => {
    requestClear();
    // register user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid token
    const quizIdTest = QuizOne.quizId;

    const newName = 'Quiz COMP1531';

    let invalidToken;

    const testNameUpdate = requestAdminQuizNameUpdate(
      invalidToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 401
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_401);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Valid token is provided, but user is not an owner of this quiz - Expect Error - Response Code 403', () => {
    requestClear();
    // register user 1
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    // create quiz - by user 1
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'A quiz about the UNSW course COMP1531'
    ).bodyString as QuizId;

    // register user 2
    const returnTokenObj2 = requestAdminRegister(
      'paul@hotmail.com',
      '123456ab',
      'Paul',
      'Archibald'
    ) as TokenString;

    const testToken2 = returnTokenObj2.token;

    // change existing quiz name
    // all parameters are valid, except
    // the change is made by user 2,
    // who is not an owner of the quiz
    const quizIdTest = QuizOne.quizId;

    const newName = 'Quiz COMP1531';

    const testNameUpdate = requestAdminQuizNameUpdate(
      testToken2,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testNameUpdate.bodyString.error };
    // test error object repsonse 403
    expect(testNameUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_403);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });
});
