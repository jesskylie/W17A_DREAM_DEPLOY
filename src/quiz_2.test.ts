// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

// assuming there are these functions in auth_2.test.ts (name could be change after finish writing auth_2.test.ts)
import { requestadminAuthRegister, requestadminAuthLogin, requestadminAuthLogout } from './auth_2.test';
import { Quizzes, Users } from './dataStore';
import exp from 'constants';
import { InvalidatedProjectKind } from 'typescript';
import { ok } from 'assert';

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

interface Token {
  token: number;
}

interface QuizId {
  quizId: number;
}

interface RequestAdminAuthRegisterReturn {
  statusCode: number;
  bodyString: Users | ErrorObject;
}

interface RequestAdminAuthLoginReturn {
  statusCode: number;
  bodyString: Token | ErrorObject;
}

interface RequestAdminQuizCreateReturn {
  statusCode: number;
  bodyString: QuizId | ErrorObject;
}

interface RequestAdminQuizInfoReturn {
  statusCode: number;
  bodyString: Quizzes | ErrorObject;
}

interface RequestAdminQuizListReturn {
  statusCode: number;
  bodyString: Quizzes[] | ErrorObject;
}

interface RequestAdminQuizRemoveReturn {
  statusCode: number;
  bodyString: Record<string, never> | ErrorObject;
}

// interfaces used throughout file - END

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - START

const requestClear = () => {
  const res = request('DELETE', SERVER_URL + `/clear`, { json: {} });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

beforeEach(() => {
  requestClear();
});

describe('HTTP tests using Jest', () => {
  test('Test successful echo', () => {
    const res = request('GET', `${url}:${port}/echo`, {
      qs: {
        echo: 'Hello',
      },
      // adding a timeout will help you spot when your server hangs
      timeout: 100,
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(RESPONSE_OK_200);
    expect(bodyObj.value).toEqual('Hello');
  });
  test('Test invalid echo', () => {
    const res = request('GET', `${url}:${port}/echo`, {
      qs: {
        echo: 'echo',
      },
      timeout: 100,
    });
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(RESPONSE_ERROR_400);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

// Helper functions:

// token should be a para in body object but idk how does it work for the function
const requestadminQuizCreate = (
  token: number,
  name: string,
  describption: string
): RequestAdminQuizCreateReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz`, {
    json: { token, name, describption },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

const requestadminQuizInfo = (token: number, quizid: number): RequestAdminQuizInfoReturn => {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin/quiz/${quizid}`,
    { json: { quizid, token } }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

const requestadminQuizRemove = (token: number, quizid: number): RequestAdminQuizRemoveReturn => {
  const res = request(
    'DELETE',
    SERVER_URL + `v1/admin/quiz/${quizid}`,
    { json: { quizid, token } }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

const requestadminQuizList = (token: number): RequestAdminQuizListReturn => {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin/quiz/list`,
    { json: { token } }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
}

// tests:
describe('adminQuizInfo testing', () => {
  // the interface above is not working and idk why so i leave these to be any first
  // let JackUser: RequestAdminAuthRegisterReturn;
  // let JackAuthUserId: RequestadminAuthLoginReturn;
  // let QuizOne: RequestadminQuizCreateReturn;
  let JackUser: RequestAdminAuthRegisterReturn;
  let returnToken: RequestAdminAuthLoginReturn;
  let QuizOne: RequestAdminQuizCreateReturn;
  beforeAll(() => {
    JackUser = requestadminAuthRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
    // shouldn't the token inside body String returning? what's does this error
    // mean Qvq
    returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab');
    QuizOne = requestadminQuizCreate(
      returnToken.bodyString.token,
      'Quiz One',
      'this is my first quiz'
    );
  });
  test('success print out quizInfo', () => {
    const quiz1Info = requestadminQuizInfo(
      returnToken.bodyString.token,
      QuizOne.bodyString.quizId
    );
    expect(quiz1Info.statusCode).toBe(RESPONSE_OK_200);
    // there are objects 'duration' & 'numQuestion' & question' didn't add in it
    expect(quiz1Info.bodyString).toStrictEqual({
      quizId: QuizOne.bodyString.quizId,
      name: 'Quiz One',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my first quiz',
    });

    const QuizTwo = requestadminQuizCreate(
      returnToken.bodyString.token,
      'Quiz Two',
      'this is my second quiz'
    );
    const quiz2Info = requestadminQuizInfo(
      returnToken.bodyString.token,
      QuizTwo.bodyString.quizId
    );
    expect(quiz2Info.statusCode).toBe(RESPONSE_OK_200);
    expect(quiz2Info.bodyString).toStrictEqual({
      quizId: QuizTwo.bodyString.quizId,
      name: 'Quiz Two',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my second quiz',
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    const emptyQuizId = requestadminQuizInfo(
      returnToken.bodyString.token,
      ''
    );
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const invalidQuizId = requestadminQuizInfo(
      returnToken.bodyString.token,
      'S'
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty or invalid(does not refer to valid logged in user session)', () => {
    const emptyQuizId = requestadminQuizInfo(
      (-1) * returnToken.bodyString.token,
      QuizOne.bodyString.quizId
    );
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    requestadminAuthLogout(returnToken);
    requestadminAuthRegister(
      'tony@hotmail.com',
      'ab123456b',
      'Tony',
      'Stark'
    );
    const returnToken2 = requestadminAuthLogin(
      'tony@hotmail.com',
      'ab123456b'
    );
    const TonyQuiz = requestadminQuizCreate(
      returnToken2.bodyString.token,
      'Jack',
      'Tony quiz'
    );
    // Problem: concept confused - once we get the link SERVER_URL, we did log in to Jack
    // User and then do we need to logout on the server and then log in to Tony User?
    // Or we can log in two account at the same time? (I'm assuming we need to log out Jack before
    // we log in to TonyUser)
    const quizIdNotReferToUser1 = requestadminQuizInfo(
      returnToken.bodyString.token,
      QuizOne.bodyString.quizId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe('Testing adminQuizRemove', () => {
  let returnToken: RequestAdminAuthLoginReturn;
  let QuizOne: RequestAdminQuizCreateReturn;
  beforeAll(() => {
    requestadminAuthRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
    // shouldn't the token inside body String returning? what's does this error
    // mean Qvq
    returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab');
    QuizOne = requestadminQuizCreate(
      returnToken.bodyString.token,
      'Quiz One',
      'this is my first quiz'
    );
  });
  test('StatusCode 200: Valid input', () => {
    requestadminQuizRemove(
      returnToken.bodyString.token, 
      QuizOne.bodyString.quizId
      );
    const checkQuizIsRemoved = requestadminQuizCreate(
      returnToken.bodyString.token,
      'Quiz Check',
      'this is the only quiz'
    );
    expect(checkQuizIsRemoved.statusCode).toBe(RESPONSE_OK_200);
    expect(checkQuizIsRemoved.bodyString).toStrictEqual({
      quizId: expect.any(Number),
    });
  });

  test('Error 400: Empty input for QuizId', () => {
    const emptyQuizId = requestadminQuizRemove(
      returnToken.bodyString.token, 
      ''
    );
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Invalid QuizId', () => {
    const invalidQuizId = requestadminQuizRemove(
      returnToken.bodyString.token,
      'abc'
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    const invalidToken = requestadminQuizRemove(
      '',
      QuizOne.bodyString.quizId
    );
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
  
  test('Error 401: Token is invalid', () => {
    const invalidToken = requestadminQuizRemove(
      (-1) * returnToken.bodyString.token,
      QuizOne.bodyString.quizId
    );
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: QuizId does not refer to a quiz that this user owns', () => {
    requestadminAuthRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Tran'
    );
    const returnToken2 = requestadminAuthLogin(
      'jess@hotmail.com',
      '123456ab'
    );
    const quizIdNotReferToUser = requestadminQuizRemove(
      returnToken2.bodyString.token,
      QuizOne.bodyString.quizId
    );
    expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe('adminQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestadminAuthRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab');
    const QuizOne = requestadminQuizCreate(
      returnToken.bodyString.token,
      'Quiz One',
      'this is my first quiz'
    );
    const QuizTwo = requestadminQuizCreate(
      returnToken.bodyString.token,
      'Quiz Two',
      'this is my second quiz'
    );
    const QuizPrint = requestadminQuizList(returnToken.bodyString.token);
    expect(QuizPrint.statusCode).toBe(RESPONSE_OK_200);
    expect(QuizPrint.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.bodyString.quizId,
          name: 'Quiz One',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'this is my first quiz',
        },
        {
          quizId: QuizTwo.bodyString.quizId,
          name: 'Quiz Two',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'this is my second quiz',
        }
      ]
    });
  });
  test('Error 401: invalid token', () => {
    const invalidToken = requestadminQuizList('invalid');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Error 401: empty token', () => {
    const invalidToken = requestadminQuizList('');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
  
});

// Test suite for /v1/admin/quiz route adminQuizCreate() - START

// From swagger.yaml file:
// Given basic details about a new quiz,
// create one for the logged in user

// Function to poll route
// Returns the body of the response as a JSON object

interface AdminQuizCreateReturn {
  quizId: number;
}

interface HTTPResponse {
  statusCode: number;
}

const requestQuizCreate = (
  token: number,
  name: string,
  description: string
): AdminQuizCreateReturn | ErrorObject => {
  const res = request('POST', SERVER_URL + 'v1/admin/quiz', {
    json: { token, name, description },
  });

  return JSON.parse(res.body.toString());
};

const requestQuizCreateStatusCode = (
  token: number,
  name: string,
  description: string
): HTTPResponse | ErrorObject => {
  const res: any = request('POST', SERVER_URL + 'v1/admin/quiz', {
    json: { token, name, description },
  });

  return res.statusCode;
};

// Tests
describe('test /v1/admin/quiz -> EXPECT SUCCESS', () => {
  const token = 12345678;
  const name = 'Paul';
  const description = 'This is the first quiz';
  test('Test successfully creating a quiz', () => {
    expect(requestQuizCreate(token, name, description)).toStrictEqual({
      token: expect.any(Number),
    });
  });
  test('Test successfully creating a quiz return status code 200', () => {
    expect(requestQuizCreateStatusCode(token, name, description)).toStrictEqual(
      RESPONSE_OK_200
    );
  });
});

describe('test /v1/admin/quiz : Name contains invalid characters -> EXPECT ERROR 400', () => {
  const token_1 = 12345678;
  const INVALID_NAME = 'Paul!!!!';
  const description_1 = 'This is the first quiz';
  test('Name contains invalid characters. Valid characters are alphanumeric and spaces -> EXPECT ERROR', () => {
    expect(
      requestQuizCreate(token_1, INVALID_NAME, description_1)
    ).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Name contains invalid characters. Valid characters are alphanumeric and spaces -> EXPECT STATUS CODE 400', () => {
    expect(
      requestQuizCreateStatusCode(token_1, INVALID_NAME, description_1)
    ).toStrictEqual(RESPONSE_ERROR_400);
  });
});

describe('test /v1/admin/quiz : Name not correct length -> EXPECT ERROR 400', () => {
  const token = 12345678;
  const VALID_NAME = 'Paul';
  const INVALID_NAME_TOO_SHORT = 'Pa';
  const INVALID_NAME_TOO_LONG =
    'PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaauuuuuuuuuuuuuuuuuuuuuuuuuuuuullllllllllllllll';
  const description = 'This is the first quiz';
  const INVALID_DESCRIPTION =
    'One possible solution is to generate type guards. Type guards are normal functions but with a signature that tells TS that the parameter of the function has a specific type. The signature consists of two things. The function must return boolean and has return type of param is myType.';

  test('Name too short -> EXPECT ERROR', () => {
    expect(
      requestQuizCreate(token, INVALID_NAME_TOO_SHORT, description)
    ).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Name too short -> EXPECT ERROR -> EXPECT STATUS CODE 400', () => {
    expect(
      requestQuizCreateStatusCode(token, INVALID_NAME_TOO_SHORT, description)
    ).toStrictEqual(RESPONSE_ERROR_400);
  });

  test('Name too long -> EXPECT ERROR', () => {
    expect(
      requestQuizCreate(token, INVALID_NAME_TOO_LONG, description)
    ).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Name too long -> EXPECT ERROR -> EXPECT STATUS CODE 400', () => {
    expect(
      requestQuizCreateStatusCode(token, INVALID_NAME_TOO_LONG, description)
    ).toStrictEqual(RESPONSE_ERROR_400);
  });

  test('Name is already used by the current logged in user for another quiz -> EXPECT ERROR', () => {
    expect(requestQuizCreate(token, VALID_NAME, description)).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Name is already used by the current logged in user for another quiz -> EXPECT ERROR -> EXPECT STATUS CODE 400', () => {
    expect(
      requestQuizCreateStatusCode(token, VALID_NAME, description)
    ).toStrictEqual(RESPONSE_ERROR_400);
  });

  test('Description is more than 100 characters in length -> EXPECT ERROR', () => {
    expect(
      requestQuizCreate(token, VALID_NAME, INVALID_DESCRIPTION)
    ).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Description is more than 100 characters in length -> EXPECT ERROR -> EXPECT STATUS CODE 400', () => {
    expect(
      requestQuizCreateStatusCode(token, VALID_NAME, INVALID_DESCRIPTION)
    ).toStrictEqual(RESPONSE_ERROR_400);
  });
});

describe('test /v1/admin/quiz : Token is empty or invalid -> EXPECT ERROR 401', () => {
  let token: any;
  const VALID_NAME = 'Paul';
  const description = 'This is the first quiz';

  test('Token is empty or invalid -> EXPECT ERROR', () => {
    expect(requestQuizCreate(token, VALID_NAME, description)).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Token is empty or invalid -> EXPECT ERROR -> EXPECT STATUS CODE 401', () => {
    expect(
      requestQuizCreateStatusCode(token, VALID_NAME, description)
    ).toStrictEqual(RESPONSE_ERROR_401);
  });
});

// Test suite for /v1/admin/quiz route adminQuizCreate() - END
