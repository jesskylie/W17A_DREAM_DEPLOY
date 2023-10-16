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
import { requestadminAuthRegister, requestadminAuthLogin } from './auth_2.test';
import { Quizzes, Users } from './dataStore';
import exp from 'constants';
import { InvalidatedProjectKind } from 'typescript';

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

interface AuthUserId {
  authUserId: number;
}

interface QuizId {
  quizId: number;
}

interface RequestAdminAuthRegisterReturn {
  statusCode: number;
  bodyString: Users | ErrorObject;
}

interface RequestadminAuthLoginReturn {
  statusCode: number;
  bodyString: AuthUserId | ErrorObject;
}

interface RequestadminQuizCreateReturn {
  statusCode: number;
  bodyString: QuizId | ErrorObject;
}

interface RequestAdminQuizInfoReturn {
  statusCode: number;
  bodyString: Quizzes | ErrorObject;
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

// I'm not sure what is the function name for auth functions so I just name them as same as quiz.test.ts shown
// probably need to change after finish auth_2.test.ts funcitons are done

// help funcitons:
// if anyone know how to combine them to just one big function and muilt small fuctions like tut05/automarking
// feel free to change what I have here (requestadminQuizCreate and requestadminQuizInfo)
const requestadminQuizCreate = (
  authUserId: number,
  name: string,
  describption: string
) => {
  const res = request('POST', SERVER_URL + `/v1/admin${authUserId}/quiz`, {
    json: { name, describption },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};
// Problem: authUserId should not be here, cuz should be login first
// But due to I'm not sure how login work so I'll leave them here first for
// testing (make sure it can run)
const requestadminQuizInfo = (authUserId: number, quizId: number) => {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin${authUserId}/quiz/${quizId}`,
    { json: {} }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

const requestadminQuizRemove = (authUserId: number, quizId: number) => {
  const res = request(
    'DELETE',
    SERVER_URL + `v1/admin${authUserId}/quiz/${quizId}`,
    { json: {} }
  );
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

// tests:
describe('adminQuizInfo testing', () => {
  // the interface above is not working and idk why so i leave these to be any first
  // let JackUser: RequestAdminAuthRegisterReturn;
  // let JackAuthUserId: RequestadminAuthLoginReturn;
  // let QuizOne: RequestadminQuizCreateReturn;
  let JackUser: any;
  let JackAuthUserId: any;
  let QuizOne: any;
  beforeAll(() => {
    JackUser = requestadminAuthRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
    // for future if we done the login part: we probably should login before doing anything
    JackAuthUserId = requestadminAuthLogin('jack@hotmail.com', '123456ab');
    QuizOne = requestadminQuizCreate(
      JackUser.bodyString.authUserId,
      'Quiz One',
      'this is my first quiz'
    );
  });
  test('success print out quizInfo', () => {
    const quiz1Info = requestadminQuizInfo(
      JackUser.bodyString.authUserId,
      QuizOne.bodyString.quizId
    );
    expect(quiz1Info.statusCode).toBe(RESPONSE_OK_200);
    expect(quiz1Info.bodyString).toStrictEqual({
      quizId: QuizOne.bodyString.quizId,
      name: 'Quiz One',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my first quiz',
    });

    const QuizTwo = requestadminQuizCreate(
      JackUser.bodyString.authUserId,
      'Quiz Two',
      'this is my second quiz'
    );
    const quiz2Info = requestadminQuizInfo(
      JackUser.bodyString.authUserId,
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

  test('Quiz ID does not refer to a valid quiz', () => {
    const emptyQuizId = requestadminQuizInfo(
      JackUser.bodyString.authUserId,
      ''
    );
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const invalidQuizId = requestadminQuizInfo(
      JackUser.bodyString.authUserId,
      'S'
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const TonyUser = requestadminAuthRegister(
      'tony@hotmail.com',
      'ab123456b',
      'Tony',
      'Stark'
    );
    const TonyQuiz = requestadminQuizCreate(
      TonyUser.bodyString.authUserId,
      'Jack',
      'Tony quiz'
    );
    const quizIdNotReferToUser1 = requestadminQuizInfo(
      JackUser.bodyString.authUserId,
      TonyQuiz.bodyString.quizId
    );
    // not very sure it is refer to 403 or 400 error cuz in swagger it mentions in both
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const quizIdNotReferToUser2 = requestadminQuizInfo(
      TonyUser.bodyString.authUserId,
      QuizOne.bodyString.quizId
    );
    expect(quizIdNotReferToUser2.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser2.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe('Testing adminQuizRemove', () => {
  test('Correct input', () => {
    const NewUser = requestadminAuthRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Tran'
    );
    const QuizId = requestadminQuizCreate(
      NewUser.bodyString.authUserId,
      'Jess',
      'description'
    );
    const removeQuiz = requestadminQuizRemove(
      NewUser.bodyString.authUserId,
      QuizId.bodyString.quizId
    );
    expect(removeQuiz.statusCode).toBe(RESPONSE_OK_200);
    expect(removeQuiz.bodyString).toStrictEqual({});
    const checkQuizIsRemove = requestadminQuizCreate(
      NewUser.bodyString.authUserId,
      'Jess',
      'description'
    );
    expect(checkQuizIsRemove.statusCode).toBe(RESPONSE_OK_200);
    expect(checkQuizIsRemove.bodyString).toStrictEqual({
      quizId: expect.any(Number),
    });
  });

  test('Empty input', () => {
    const emptyQuizId = requestadminQuizRemove('', '');
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Invalid QuizId', () => {
    const NewUser = requestadminAuthRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Tran'
    );
    const QuizId = requestadminQuizCreate(
      NewUser.bodyString.authUserId,
      'Jess',
      'description'
    );
    const invalidQuizId = requestadminQuizRemove(
      NewUser.bodyString.authUserId,
      'abc'
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('QuizId does not refer to a quiz that this user owns', () => {
    const JessUser = requestadminAuthRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Tran'
    );
    const AdamUser = requestadminAuthRegister(
      'adam@hotmail.com',
      'ab123456',
      'Adam',
      'Lee'
    );
    const JessQuizId = requestadminQuizCreate(
      JessUser.bodyString.authUserId,
      'Jess',
      'description'
    );
    const AdamQuizId = requestadminQuizCreate(
      AdamUser.bodyString.authUserId,
      'Jess',
      'description'
    );
    const quizIdNotReferToUser = requestadminQuizRemove(
      JessUser.bodyString.authUserId,
      AdamQuizId.bodyString.quizId
    );
    expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser.bodyString).toStrictEqual({
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
