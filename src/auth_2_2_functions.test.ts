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

import { Quizzes } from './dataStore';
import { adminAuthRegister, adminUserDetails } from './auth';

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

interface ErrorObjectWithCode {
  error: string;
  errorCode: number;
}

interface Token {
  token: string;
}

interface QuizId {
  quizId: number;
}

interface RequestAdminAuthLoginReturn {
  statusCode?: number;
  bodyString: Token | ErrorObject;
}

interface RequestAdminQuizCreateReturn {
  statusCode?: number;
  bodyString: QuizId | ErrorObject;
}

interface RequestAdminQuizInfoReturn {
  statusCode?: number;
  bodyString: Quizzes | ErrorObject;
}

interface RequestAdminQuizListReturn {
  statusCode?: number;
  bodyString: Quizzes[] | ErrorObject;
}

interface RequestAdminQuizRemoveReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

interface RequestAdminQuizCreateReturn {
  statusCode?: number;
  bodyString: QuizId | ErrorObject;
}

interface RequestAdminLogoutReturn {
  statusCode: number;
  bodyString: ErrorObject | Record<string, never>;
}

// interfaces used throughout file - END

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

// Functions to call routes used within this file - START

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

function requestAdminLogout(token: string): RequestAdminLogoutReturn {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
    json: {
      token,
    },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return { bodyString, statusCode };
}

const requestClear = () => {
  const res = request('DELETE', SERVER_URL + `/v1/clear`, {
    timeout: WAIT_TIME,
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

// beforeAll(() => {
//   requestClear();
// });

// Functions to call routes used within this file - END

// --------------------------------------------------
// Test suite for adminLogout function - START

describe('test adminLogout : Returns an empty object -> EXPECT SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    );

    // logout user

    if ('token' in testRegisterFn) {
      const token = testRegisterFn.token;
      const testLogoutFn = adminLogout(token);

      // test for returned empty object
      expect(testLogoutFn).toStrictEqual({});

      // test for invalid token (token does not exist now)

      const testForNoUserDetails = adminUserDetails(token);

      if ('error' in testForNoUserDetails) {
        const errorObject = testForNoUserDetails;
        // test for error object
        expect(errorObject).toStrictEqual({ error: expect.any(String) });
      }
    }
  });
});

describe('test adminLogout : Token is invalid or empty -> EXPECT ERROR', () => {
  test('Returns error object -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // logout user
    const token = '';

    const testLogoutFn = adminLogout(token);

    if ('error' in testLogoutFn) {
      const errorObj = testLogoutFn;

      // test for error object
      expect(errorObj).toStrictEqual({ error: expect.any(String) });
    }
  });
});

// Test suite for adminLogout function - END

// --------------------------------------------------
// Test suite for /v1/admin/auth/logout route - START

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

describe('test /v1/admin/auth/logout : Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterRt = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    );

    console.log('testRegisterRt ->', testRegisterRt);

    // logout user
    if ('token' in testRegisterRt) {
      const token = testRegisterRt.token;

      const testLogout = requestAdminLogout(token);

      // test for returned empty object
      if ('bodyString' in testLogout) {
        expect(testLogout).toStrictEqual({});
      }

      if ('statusCode' in testLogout) {
        const statusCode = testLogout.statusCode;
        expect(statusCode).toStrictEqual(RESPONSE_OK_200);
      }
    }
  });
});

describe('test /v1/admin/auth/logout : Returns an error object -> EXPECT ERROR CODE 401', () => {
  test('Returns error object -> EXPECT ERROR CODE 401', () => {
    requestClear();

    // logout user
    // logout user
    const token = '';

    const testLogout = requestAdminLogout(token);

    // test for returned empty object
    if ('bodyString' in testLogout) {
      expect(testLogout).toStrictEqual({ error: expect.any(String) });
    }

    if ('statusCode' in testLogout) {
      const statusCode = testLogout.statusCode;
      expect(statusCode).toStrictEqual(RESPONSE_ERROR_401);
    }
  });
});

// Test suite for /v1/admin/auth/logout route adminQuizCreate() - END
