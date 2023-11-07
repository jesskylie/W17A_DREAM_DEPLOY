import HTTPError from 'http-errors';
import {
  // requestAdminQuizCreate,
  // requestAdminQuizInfo,
  // requestAdminQuizQuestionMove,
  requestClear,
  requestAdminRegister,
  requestAdminLogoutV2,
  // requestCreateQuestion,
  // requestDeleteQuizQuestion,
  // requestDuplicateQuestion,
  // requestUpdateQuestion,
} from './library/route_testing_functions';
import {
  QuestionBody,
  QuestionId,
  QuizId,
  TokenString,
  requestAdminQuizInfoReturn,
} from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  RESPONSE_OK_200,
} from './library/constants';
import { Quizzes } from './dataStore';

// --------------------------------------------------
// Test suite for /v2/admin/auth/logout route - START

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

interface RequestAdminRegisterReturn {
  body: TokenString;
  status: number;
}

describe('test /v2/admin/auth/logout : Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // logout user
    // expect empty object and status code 200

    const token = testRegister.body.token;

    const testLogout = requestAdminLogoutV2(token);

    const statusCode = testRegister.status;

    expect(testLogout).toStrictEqual({});

    expect(statusCode).toStrictEqual(RESPONSE_OK_200);
  });
});

describe('test /v1/admin/auth/logout : Returns an error object -> EXPECT ERROR CODE 401', () => {
  test('Returns error object -> EXPECT ERROR CODE 401', () => {
    requestClear();

    // logout user with invalid token
    const token = '';

    expect(() => requestAdminLogoutV2(token)).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });
});

// Test suite for /v2/admin/auth/logout  - END
