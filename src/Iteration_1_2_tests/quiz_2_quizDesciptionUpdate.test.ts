// Do not delete this file _
import request from 'sync-request-curl';
import config from '../config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from '../library/constants';

import { TokenString } from '../library/interfaces';

import { Quizzes } from '../dataStore';

import {
  requestClear,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
} from '../library/route_testing_functions';

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

interface RequestAdminQuizDescriptionUpdateReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

// interfaces used throughout file - END

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

const requestAdminQuizDescriptionUpdate = (
  token: string,
  quizid: number,
  description: string
): RequestAdminQuizDescriptionUpdateReturn => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizid}/description`,
    {
      json: { token, quizid, description },
    }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

describe('Testing adminQuizDescriptionUpdate', () => {
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
      'A quiz about the UNSW course COMP1511'
    ).bodyString as QuizId;

    const quizIdTest = QuizOne.quizId;

    const newDescription = 'A quiz about the UNSW course COMP1531';

    const testDescriptionUpdate = requestAdminQuizDescriptionUpdate(
      testToken,
      quizIdTest,
      newDescription
    );
    // test for normal response: status code 200 and empty object
    expect(testDescriptionUpdate.statusCode).toStrictEqual(RESPONSE_OK_200);
    expect(testDescriptionUpdate.bodyString).toStrictEqual({});

    // test for new quiz name
    const testNewDescriptionChangedObj = requestAdminQuizInfo(
      testToken,
      quizIdTest
    );

    if ('bodyString' in testNewDescriptionChangedObj) {
      const testBodyString = testNewDescriptionChangedObj.bodyString as Quizzes;
      const testDescription = testBodyString.description;
      expect(testDescription).toStrictEqual(newDescription);
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

    const testDescriptionUpdate = requestAdminQuizDescriptionUpdate(
      testToken,
      quizIdTest,
      newName
    );

    const errorStringObject = { error: testDescriptionUpdate.bodyString.error };
    // test error object repsonse 400
    expect(testDescriptionUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Description name greater than 100 characters - Expect Error - Response Code 400', () => {
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

    // change existing quiz description
    // invalid desciption - too long, greater than 100 characterrs
    const quizIdTest = QuizOne.quizId;

    const newDescription =
      'A quiz about TypeScript. Typescript is a superset that provides additional features to the Javascript programming language.';

    const testDescriptionUpdate = requestAdminQuizDescriptionUpdate(
      testToken,
      quizIdTest,
      newDescription
    );

    const errorStringObject = { error: testDescriptionUpdate.bodyString.error };
    // test error object repsonse 400
    expect(testDescriptionUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_400);
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
      'A quiz about the UNSW course COMP1511'
    ).bodyString as QuizId;

    // change existing quiz name
    // invalid token
    const quizIdTest = QuizOne.quizId;

    const newDescription = 'A quiz about the UNSW course COMP1531';

    let invalidToken;

    const testDescriptionUpdate = requestAdminQuizDescriptionUpdate(
      invalidToken,
      quizIdTest,
      newDescription
    );

    const errorStringObject = { error: testDescriptionUpdate.bodyString.error };
    // test error object repsonse 401
    expect(testDescriptionUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_401);
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

    const newDescription = 'A quiz about the UNSW course COMP1531';

    const testDescriptionUpdate = requestAdminQuizDescriptionUpdate(
      testToken2,
      quizIdTest,
      newDescription
    );

    const errorStringObject = { error: testDescriptionUpdate.bodyString.error };
    // test error object repsonse 403
    expect(testDescriptionUpdate.statusCode).toStrictEqual(RESPONSE_ERROR_403);
    expect(errorStringObject).toStrictEqual({
      error: expect.any(String),
    });
  });
});
