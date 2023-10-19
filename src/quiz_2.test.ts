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

// assuming there are these functions in auth_2.test.ts (name could be change after finish writing auth_2.test.ts)
import { adminAuthRegister, adminAuthLogin } from './auth';
import { Quizzes } from './dataStore';
import { clear } from 'console';
import { TIMEOUT } from 'dns';

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
): requestAdminAuthLoginReturn => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password },
  });
  const bodyString = JSON.parse(res.body.toString());

  return { statusCode: res.statusCode, bodyString: bodyString };
};

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

interface requestAdminAuthLoginReturn {
  statusCode?: number;
  bodyString: Token | ErrorObject;
}

interface requestAdminQuizCreateReturn {
  statusCode?: number;
  bodyString: QuizId | ErrorObject;
}

interface requestAdminQuizInfoReturn {
  statusCode?: number;
  bodyString: Quizzes | ErrorObject;
}

interface requestAdminQuizListReturn {
  statusCode?: number;
  bodyString: Quizzes[] | ErrorObject;
}

interface requestAdminQuizRemoveReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

interface requestAdminTrashQuizRestoreReturn {
  statusCode?: number;
  bodyString: Record<string, never> | ErrorObject;
}

interface requestAdminQuizCreateReturn {
  statusCode?: number;
  bodyString: QuizId | ErrorObject;
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

beforeAll(() => {
  requestClear();
});

// describe('HTTP tests using Jest', () => {
//   test('Test successful echo', () => {
//     const res = request('GET', `${url}:${port}/echo`, {
//       qs: {
//         echo: 'Hello',
//       },
//       // adding a timeout will help you spot when your server hangs
//       timeout: 100,
//     });
//     const bodyObj = JSON.parse(res.body as string);
//     expect(res.statusCode).toBe(RESPONSE_OK_200);
//     expect(bodyObj.value).toEqual('Hello');
//   });
//   test('Test invalid echo', () => {
//     const res = request('GET', `${url}:${port}/echo`, {
//       qs: {
//         echo: 'echo',
//       },
//       timeout: 100,
//     });
//     const bodyObj = JSON.parse(res.body as string);
//     expect(res.statusCode).toBe(RESPONSE_ERROR_400);
//     expect(bodyObj.error).toStrictEqual(expect.any(String));
//   });
// });

// // Helper functions:

export const requestAdminQuizCreate = (
  token: string,
  name: string,
  description: string
): requestAdminQuizCreateReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz`, {
    json: { token, name, description },
  });
  return {
    statusCode: res.statusCode,
    bodyString: JSON.parse(res.body.toString()),
  };
};

const requestAdminQuizInfo = (
  token: string,
  quizid: number
): requestAdminQuizInfoReturn => {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    qs: {
      token,
      quizid,
    },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

const requestAdminQuizRemove = (
  token: string,
  quizid: number
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizid}`, {
    qs: { quizid, token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

const requestAdminQuizList = (token: string): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/list`, {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

// ***********************************************************************************
// tests:
describe('adminQuizInfo testing', () => {
  // the interface above is not working and idk why so i leave these to be any first
  // let JackUser: requestAdminAuthRegisterReturn;
  // let JackAuthUserId: requestAdminAuthLoginReturn;
  // let QuizOne: requestAdminQuizCreateReturn;
  beforeAll(() => {
    requestAdminRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
  });
  test('StatusCode 200: Valid input', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const quiz1Info = requestAdminQuizInfo(returnToken.token, QuizOne.quizId);
    // there are objects 'duration' & 'numQuestion' & 'question' didn't add in it
    expect(quiz1Info.bodyString).toStrictEqual({
      quizId: QuizOne.quizId,
      name: 'Quiz One',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my first quiz',
      /*
      numQuestion:
      question:
      duration:
      */
    });

    const QuizTwo = requestAdminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    const quiz2Info = requestAdminQuizInfo(returnToken.token, QuizTwo.quizId);
    expect(quiz2Info.bodyString).toStrictEqual({
      quizId: QuizTwo.quizId,
      name: 'Quiz Two',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my second quiz',
      /*
      numQuestion:
      question:
      duration:
      */
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const quizIdIsInvalid = requestAdminQuizInfo(returnToken.token, -1 * 1531);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 401: Token is empty', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminQuizInfo('', Quiz.quizId);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 401: Token is invalid', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz 2',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminQuizInfo('invalid', Quiz.quizId);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    requestAdminRegister('tony@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin('tony@hotmail.com', 'ab123456b')
      .bodyString as Token;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Jack',
      'Tony quiz'
    ).bodyString as QuizId;
    const quizIdNotReferToUser1 = requestAdminQuizInfo(
      returnToken.token,
      TonyQuiz.quizId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    // console.log(quizIdNotReferToUser1.bodyString);
    // this should only return error instead of returnning both error and errorcode in
    // bodystring
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_403,
    });
  });
});

describe('Testing adminQuizRemove', () => {
  beforeAll(() => {
    adminAuthRegister('jess@hotmail.com', '123456ab', 'Jack', 'Harlow');
  });
  test('Status Code 200: Correct input', () => {
    const returnToken = requestAdminAuthLogin('jess@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken.token, QuizOne.quizId);
    const checkQuizIsRemoved = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is the only quiz'
    );
    expect(checkQuizIsRemoved.bodyString).toStrictEqual({
      quizId: expect.any(Number),
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const quizIdIsInvalid = requestAdminQuizRemove(
      returnToken.token,
      -1 * 1531
    );
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 401: Token is empty', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz a',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminQuizRemove('', Quiz.quizId);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 401: Token is invalid', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz b',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminQuizRemove('invalid', Quiz.quizId);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 403: QuizId does not refer to a quiz that this user owns', () => {
    // requestClear();
    const returnToken = requestAdminAuthLogin('jess@hotmail.com', '123456ab')
      .bodyString as Token;
    requestAdminRegister('peter@hotmail.com', 'pass123456', 'Peter', 'Parker');
    const returnToken2 = requestAdminAuthLogin(
      'peter@hotmail.com',
      'pass123456'
    ).bodyString as Token;
    const peterQuizId = requestAdminQuizCreate(
      returnToken2.token,
      'Peter',
      'description'
    ).bodyString as QuizId;
    // console.log(peterQuizId);
    const quizIdNotReferToUser = requestAdminQuizRemove(
      returnToken.token,
      peterQuizId.quizId
    );
    expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_403,
    });
  });
});

describe('adminQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestAdminRegister('jack1@hotmail.com', '123456ab', 'Jack', 'Harlow');
    const returnToken = requestAdminAuthLogin('jack1@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    const QuizPrint = requestAdminQuizList(returnToken.token);
    expect(QuizPrint.bodyString).toStrictEqual({
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
    const invalidToken = requestAdminQuizList('invalid');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });
  test('Error 401: empty token', () => {
    const invalidToken = requestAdminQuizList('');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });
});

// ***********************************************************************************
// tests (Iteration Part 2):

// adminTrashQuizList:

const requestAdminTrashQuizList = (token: string): requestAdminQuizListReturn => {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/trash`, {
    qs: { token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

describe('adminTrashQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestAdminRegister('alex@hotmail.com', '123456ab', 'Alex', 'Hams');
    const returnToken = requestAdminAuthLogin('alex@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken.token, QuizOne.quizId);
    const TrashQuizPrint = requestAdminTrashQuizList(returnToken.token);
    expect(TrashQuizPrint.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
      ],
    });
    requestAdminQuizRemove(returnToken.token, QuizTwo.quizId);
    const TrashQuizPrint2 = requestAdminTrashQuizList(returnToken.token);
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
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 401: empty token', () => {
    const invalidToken = requestAdminTrashQuizList('');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });
});

// adminTrashQuizRestore

const requestAdminTrashQuizRestore = (token: string, quizId: number): requestAdminTrashQuizRestoreReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, {
    json: { token, quizId },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

describe('adminTrashQuizRestore testing', () => {
  beforeAll(() => {
    requestAdminRegister('alex1@hotmail.com', '123456ab', 'Jack', 'Harlow');
  });
  test('StatusCode 200: Valid input', () => {
    const returnToken = requestAdminAuthLogin('alex1@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken.token, QuizOne.quizId);
    requestAdminQuizRemove(returnToken.token, QuizTwo.quizId);
    requestAdminTrashQuizRestore(returnToken.token, QuizOne.quizId);
    const quizOneRestored = requestAdminQuizList(returnToken.token);
    expect(quizOneRestored.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
      ],
    });
    requestAdminTrashQuizRestore(returnToken.token, QuizTwo.quizId);
    const quizTwoRestored = requestAdminQuizList(returnToken.token);
    expect(quizTwoRestored.bodyString).toStrictEqual({
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

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    const returnToken = requestAdminAuthLogin('alex1@hotmail.com', '123456ab')
      .bodyString as Token;
    const quizIdIsInvalid = requestAdminTrashQuizRestore(returnToken.token, -1 * 1531);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 400: Quiz name of the restored quiz is already used by another active quiz', () => {
    const returnToken = requestAdminAuthLogin('alex1@hotmail.com', '123456ab')
    .bodyString as Token;
    const quiz1 = requestAdminQuizCreate(
      returnToken.token,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken.token, quiz1.quizId);
    requestAdminQuizCreate(
      returnToken.token,
      'Quiz 1',
      'this is my second quiz'
    );
    const quizNameInvalid = requestAdminTrashQuizRestore(returnToken.token, quiz1.quizId);
    expect(quizNameInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizNameInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 400: Quiz ID refers to a quiz that is not currently in the trash', () => {
    const returnToken = requestAdminAuthLogin('alex1@hotmail.com', '123456ab')
    .bodyString as Token;
    const quiz1 = requestAdminQuizCreate(
      returnToken.token,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const quizIdNotInTrash = requestAdminTrashQuizRestore(returnToken.token, quiz1.quizId);
    expect(quizIdNotInTrash.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdNotInTrash.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 401: Token is empty', () => {
    const returnToken = requestAdminAuthLogin('alex1@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz a',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminTrashQuizRestore('', Quiz.quizId);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 401: Token is invalid', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz b',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminTrashQuizRestore('invalid', Quiz.quizId);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    const returnToken = requestAdminAuthLogin('alex1@hotmail.com', '123456ab')
      .bodyString as Token;
    requestAdminRegister('tony1@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin('tony1@hotmail.com', 'ab123456b')
      .bodyString as Token;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Jack',
      'Tony quiz'
    ).bodyString as QuizId;
    const quizIdNotReferToUser1 = requestAdminTrashQuizRestore(
      returnToken.token,
      TonyQuiz.quizId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    // console.log(quizIdNotReferToUser1.bodyString);
    // this should only return error instead of returnning both error and errorcode in
    // bodystring
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_403,
    });
  });
});

// adminTrashQuizEmpty

const requestAdminTrashQuizEmpty = (
  token: string,
  quizids: number[]
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/trash/empty`, {
    qs: { quizids, token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};


describe('adminTrashQuizEmpty testing', () => {
  beforeAll(() => {
    requestAdminRegister('emma1@hotmail.com', '123456ab', 'Emma', 'Homes');
  });
  test('StatusCode 200: Valid input', () => {
    const returnToken = requestAdminAuthLogin('emma1@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken.token, QuizOne.quizId);
    requestAdminQuizRemove(returnToken.token, QuizTwo.quizId);
    requestAdminTrashQuizEmpty(returnToken.token, [QuizOne.quizId]);
    const quizOneRestoredfail = requestAdminQuizList(returnToken.token);
    expect(quizOneRestoredfail.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizOneRestoredfail.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
    requestAdminTrashQuizRestore(returnToken.token, QuizTwo.quizId);
    const quizTwoRestored = requestAdminQuizList(returnToken.token);
    expect(quizTwoRestored.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizTwo.quizId,
          name: 'Quiz Two',
        },
      ],
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    const returnToken = requestAdminAuthLogin('emma1@hotmail.com', '123456ab')
      .bodyString as Token;
    const quizIdIsInvalid = requestAdminTrashQuizEmpty(returnToken.token, [-1 * 1531]);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 400: Quiz ID refers to a quiz that is not currently in the trash', () => {
    const returnToken = requestAdminAuthLogin('emma1@hotmail.com', '123456ab')
    .bodyString as Token;
    const quiz1 = requestAdminQuizCreate(
      returnToken.token,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const quizIdNotInTrash = requestAdminTrashQuizEmpty(returnToken.token, [quiz1.quizId]);
    expect(quizIdNotInTrash.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdNotInTrash.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_400,
    });
  });

  test('Error 401: Token is empty', () => {
    const returnToken = requestAdminAuthLogin('emma1@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz a',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminTrashQuizEmpty('', [Quiz.quizId]);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 401: Token is invalid', () => {
    const returnToken = requestAdminAuthLogin('emma1@hotmail.com', '123456ab')
      .bodyString as Token;
    const Quiz = requestAdminQuizCreate(
      returnToken.token,
      'Quiz b',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminTrashQuizEmpty('invalid', [Quiz.quizId]);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_401,
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    const returnToken = requestAdminAuthLogin('emma1@hotmail.com', '123456ab')
      .bodyString as Token;
    requestAdminRegister('ricky1@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin('ricky1@hotmail.com', 'ab123456b')
      .bodyString as Token;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Jack',
      'Tony quiz'
    ).bodyString as QuizId;
    const quizIdNotReferToUser1 = requestAdminTrashQuizEmpty(
      returnToken.token,
      [TonyQuiz.quizId]
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    // console.log(quizIdNotReferToUser1.bodyString);
    // this should only return error instead of returnning both error and errorcode in
    // bodystring
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: RESPONSE_ERROR_403,
    });
  });
});


// Iteration 2 Part 2 test for trashlist, trashrestore and trashempty - END 

// Test suite for /v1/admin/quiz route adminQuizCreate() - START

// From swagger.yaml file:
// Given basic details about a new quiz,
// create one for the logged in user

// Function to poll route
// Returns the body of the response as a JSON object

// All tests in this suite passed Tuesday 17-Oct23 12:05

interface AdminQuizCreateReturn {
  quizId: number;
}

interface HTTPResponse {
  statusCode: number;
}

interface AdminQuizCreateReturnCombined {
  resBody: AdminQuizCreateReturn | ErrorObjectWithCode;
}

const requestQuizCreateCombined = (
  token: string,
  name: string,
  description: string
): AdminQuizCreateReturnCombined | HTTPResponse => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description },
  });

  const resBody = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return { resBody, statusCode };
};

// Tests
// Passed Wednesday 18-Oct-23 14:20
describe('test 1: /v1/admin/quiz -> EXPECT SUCCESS AND STATUSCODE 200', () => {
  test('Test successfully creating a quiz', () => {
    requestClear();

    // Create user
    const email = 'paulemail1@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const tokenObj = requestAdminRegister(email, password, nameFirst, nameLast);

    const name = 'Paul';
    const description = 'This is the first quiz';

    const testrequestQuizCreate = requestQuizCreateCombined(
      tokenObj.token,
      name,
      description
    );

    if ('resBody' in testrequestQuizCreate) {
      const testResBody = testrequestQuizCreate;
      if ('quizId' in testResBody) {
        const testQuizId = testResBody.quizId;
        const testCase = { quizId: testQuizId };
        expect(testCase).toStrictEqual({
          quizId: expect.any(Number),
        });
      }
    }

    // Test for code 200

    // need to test for code 200 in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('statusCode' in testrequestQuizCreate) {
      const testStatusCode = testrequestQuizCreate.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_OK_200);
    }
  });
});

// Passed Wednesday 18-Oct-23 14:20
describe('test 2: /v1/admin/quiz : Name contains invalid characters -> EXPECT ERROR 400', () => {
  test('Name contains invalid characters. Valid characters are alphanumeric and spaces -> EXPECT ERROR STRING AND ERROR CODE 400', () => {
    requestClear();

    // Create user
    const email = 'paulemail2@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const tokenObj = requestAdminRegister(email, password, nameFirst, nameLast);

    const INVALID_NAME = 'InvalidQuizName!!!!';
    const description_1 = 'This is the first quiz';

    const test1Obj = requestQuizCreateCombined(
      tokenObj.token,
      INVALID_NAME,
      description_1
    );

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test1Obj) {
      const testErrorObj = test1Obj.resBody;
      if ('error' in testErrorObj) {
        const testCase = testErrorObj.error;
        const errorStringObj = { error: testCase };
        expect(errorStringObj).toStrictEqual({
          error: expect.any(String),
        });
      }

      // Test for error code 400

      // need to test for error in test1Obj as TS
      // does not yet appreciate that .error property can
      // be in test1Obj
      if ('resBody' in test1Obj) {
        const testResBody = test1Obj.resBody;
        if ('errorCode' in testResBody) {
          const errorCode = testResBody.errorCode;
          expect(errorCode).toStrictEqual(RESPONSE_ERROR_400);
        }
      }
    }
  });
});

// Passed Wednesday 18-Oct-23 14:20
describe('test 3: /v1/admin/quiz : Errors with quiz name or description', () => {
  test('Name too short -> EXPECT ERROR STRING AND ERROR CODE 400', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const tokenObj = requestAdminRegister(email, password, nameFirst, nameLast);

    const INVALID_NAME_TOO_SHORT = 'Va';

    const description1 = 'This is the first quiz';

    const test1Obj = requestQuizCreateCombined(
      tokenObj.token,
      INVALID_NAME_TOO_SHORT,
      description1
    );

    // Test for error string

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test1Obj) {
      const testResBody = test1Obj.resBody;
      if ('error' in testResBody) {
        const errorStringObj = { error: testResBody.error };
        expect(errorStringObj).toStrictEqual({
          error: expect.any(String),
        });
      }
    }

    // Test for error code 400

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test1Obj) {
      const testResBody = test1Obj.resBody;
      if ('errorCode' in testResBody) {
        const errorCode = testResBody.errorCode;
        expect(errorCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Name too long -> EXPECT ERROR STRING AND ERROR CODE 400', () => {
    requestClear();

    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';
    const description3 = 'This is the third quiz';

    const INVALID_NAME_TOO_LONG =
      'TTTTTTTTTTTTTTTTTTTTHHHHHHHHHHHHHHHHHHHHHHHHIIIIIIIIIIIIIIIIIIIIINNNNNNNNNNNNNAAAAAAAAAAAAAAAAAMMMMMMMMMMMMMMMEEEEEEEEEEEIISSSSSSSSTTTTTTTTTTTTOOOOOOOOOOOOOOOOLLLLLLLLLLLOOOOOOOOOOOONNNNNNNNNNNNNNNGGGGGGGGGGG';

    const tokenObj = requestAdminRegister(email, password, nameFirst, nameLast);
    const test2Obj = requestQuizCreateCombined(
      tokenObj.token,
      INVALID_NAME_TOO_LONG,
      description3
    );

    // Test for error string

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test2Obj) {
      const testResBody = test2Obj.resBody;
      if ('error' in testResBody) {
        const errorStringObj = { error: testResBody.error };
        expect(errorStringObj).toStrictEqual({
          error: expect.any(String),
        });
      }
    }

    // Test for error code 400

    // need to test for error in test2Obj as TS
    // does not yet appreciate that .error property can
    // be in test2Obj
    if ('resBody' in test2Obj) {
      const testResBody = test2Obj.resBody;
      if ('errorCode' in testResBody) {
        const errorCode = testResBody.errorCode;
        expect(errorCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Name is already used by the current logged in user for another quiz -> EXPECT ERROR STRING AND ERROR CODE 400', () => {
    requestClear();

    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const VALID_NAME = 'ValidQuizName';
    const description1 = 'This is the first quiz';

    const tokenObj = requestAdminRegister(email, password, nameFirst, nameLast);
    requestQuizCreateCombined(tokenObj.token, VALID_NAME, description1);
    const test4Obj = requestQuizCreateCombined(
      tokenObj.token,
      VALID_NAME,
      description1
    );

    // Test for error string

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test4Obj) {
      const testResBody = test4Obj.resBody;
      if ('error' in testResBody) {
        const errorStringObj = { error: testResBody.error };
        expect(errorStringObj).toStrictEqual({
          error: expect.any(String),
        });
      }
    }

    // Test for error code 400

    // need to test for error in test4Obj as TS
    // does not yet appreciate that .error property can
    // be in test4Obj
    if ('resBody' in test4Obj) {
      const testResBody = test4Obj.resBody;
      if ('errorCode' in testResBody) {
        const errorCode = testResBody.errorCode;
        expect(errorCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Description is more than 100 characters in length -> EXPECT ERROR STRING AND ERROR CODE 400', () => {
    requestClear();

    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const VALID_NAME2 = 'ValidQuizNamee';

    const INVALID_DESCRIPTION =
      'One possible solution is to generate type guards. Type guards are normal functions but with a signature that tells TS that the parameter of the function has a specific type. The signature consists of two things. The function must return boolean and has return type of param is myType.';

    const tokenObj = requestAdminRegister(email, password, nameFirst, nameLast);
    const test5Obj = requestQuizCreateCombined(
      tokenObj.token,
      VALID_NAME2,
      INVALID_DESCRIPTION
    );

    // Test for error string

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test5Obj) {
      const testResBody = test5Obj.resBody;
      if ('error' in testResBody) {
        const errorStringObj = { error: testResBody.error };
        expect(errorStringObj).toStrictEqual({
          error: expect.any(String),
        });
      }
    }

    // Test for error code 400

    // need to test for error in test5Obj as TS
    // does not yet appreciate that .error property can
    // be in test5Obj
    if ('resBody' in test5Obj) {
      const testResBody = test5Obj.resBody;
      if ('errorCode' in testResBody) {
        const errorCode = testResBody.errorCode;
        expect(errorCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });
});

// Passed Wednesday 18-Oct-23 14:20
describe('test /v1/admin/quiz : Token is empty or invalid -> EXPECT ERROR 401', () => {
  test('Token is empty or invalid -> EXPECT ERROR STRING AND ERROR CODE 401', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    requestAdminRegister(email, password, nameFirst, nameLast);
    let token: any;
    const VALID_NAME = 'Paul';
    const description = 'This is the first quiz';

    const test6Obj = requestQuizCreateCombined(token, VALID_NAME, description);

    // Test for error string

    // need to test for error in test1Obj as TS
    // does not yet appreciate that .error property can
    // be in test1Obj
    if ('resBody' in test6Obj) {
      const testResBody = test6Obj.resBody;
      if ('error' in testResBody) {
        const errorStringObj = { error: testResBody.error };
        expect(errorStringObj).toStrictEqual({
          error: expect.any(String),
        });
      }
    }

    // Test for error code 400

    // need to test for error in test6Obj as TS
    // does not yet appreciate that .error property can
    // be in test6Obj
    if ('resBody' in test6Obj) {
      const testResBody = test6Obj.resBody;
      if ('errorCode' in testResBody) {
        const errorCode = testResBody.errorCode;
        expect(errorCode).toStrictEqual(RESPONSE_ERROR_401);
      }
    }
  });
});

// Test suite for /v1/admin/quiz route adminQuizCreate() - END

//****************************************************************** */
const requestAdminQuizDescriptionUpdate = (
  token: string,
  quizid: number,
  description: string
) => {
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
//****************************************************************** */
//****************************************************************** */
const requestAdminQuizNameUpdate = (
  token: string,
  quizid: number,
  name: string
) => {
  const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizid}/name`, {
    json: { token, quizid, name },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};
//****************************************************************** */
describe('Testing adminQuizNameUpdate', () => {
  beforeAll(() => {
    requestAdminRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
  });
  test('Status Code 200: Correct input', () => {
    let returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab');
    returnToken.bodyString = returnToken.bodyString as Token;
    //   console.log(returnToken);
    //  console.log(returnToken.bodyString.token);
    const QuizOne = requestAdminQuizCreate(
      returnToken.bodyString.token,
      'helllllllo',
      'this is my first quiz'
    ).bodyString as QuizId;
    // console.log(QuizOne)
    // console.log(QuizOne.quizId);

    // console.log(requestAdminQuizNameUpdate(
    //   returnToken.bodyString.token,
    //   QuizOne.quizId,
    //   'NewName'
    // ));

    const adminQuizUpdatedInfo = requestAdminQuizInfo(
      returnToken.bodyString.token,
      QuizOne.quizId
    ).bodyString as Quizzes;
    // console.log("admininfo");
    // console.log(adminQuizUpdatedInfo);

    //   expect(adminQuizUpdatedInfo.name).toStrictEqual('NewName');
  });

  test('Error 400: incorrect QuizId', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const IncorrectQuizId = requestAdminQuizNameUpdate(
      returnToken.token,
      -999,
      'Updated name'
    );
    expect(IncorrectQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(IncorrectQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
      errorCode: 400,
    });
  });

  test('Error 400: Name contains invalid characters.', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;

    const IncorrectName = requestAdminQuizNameUpdate(
      returnToken.token,
      QuizOne.quizId,
      'NewName#$$%3'
    );
    expect(IncorrectName.statusCode).toBe(RESPONSE_ERROR_400);
    expect(IncorrectName.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Name less than 3 characters.', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;

    const IncorrectName = requestAdminQuizNameUpdate(
      returnToken.token,
      QuizOne.quizId,
      'lo'
    );
    expect(IncorrectName.statusCode).toBe(RESPONSE_ERROR_400);
    expect(IncorrectName.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Name more than 30 characters.', () => {
    const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
      .bodyString as Token;
    const QuizOne = requestAdminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;

    const IncorrectName = requestAdminQuizNameUpdate(
      returnToken.token,
      QuizOne.quizId,
      'lrovkitivnvnvruvrnrunvvnvnfvbyubuuififjeifrvivefvnfeivefvinfvrververve'
    );
    expect(IncorrectName.statusCode).toBe(RESPONSE_ERROR_400);
    expect(IncorrectName.bodyString).toStrictEqual({
      error: expect.any(String),
    });

    test('Error 400: incorrect QuizId', () => {
      const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
        .bodyString as Token;
      const IncorrectQuizId = requestAdminQuizNameUpdate(
        returnToken.token,
        -999,
        'Updated name'
      );
      expect(IncorrectQuizId.statusCode).toBe(RESPONSE_ERROR_400);
      expect(IncorrectQuizId.bodyString).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Error 401: Empty authUserId', () => {
      const returnToken2 = requestAdminAuthLogin('adam@hotmail.com', '123456ab')
        .bodyString as Token;
      const AdamQuizId = requestAdminQuizCreate(
        returnToken2.token,
        'Jess',
        'description'
      ).bodyString as QuizId;
      const quizIdNotReferToUser = requestAdminQuizNameUpdate(
        '',
        AdamQuizId.quizId,
        'updatedName'
      );
      expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_401);
      expect(quizIdNotReferToUser.bodyString).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Error 401: Invalid authUserId', () => {
      const returnToken2 = requestAdminAuthLogin('adam@hotmail.com', '123456ab')
        .bodyString as Token;
      const AdamQuizId = requestAdminQuizCreate(
        returnToken2.token,
        'Jess',
        'description'
      ).bodyString as QuizId;
      const quizIdNotReferToUser = requestAdminQuizNameUpdate(
        'InvalidAuthUserId$3',
        AdamQuizId.quizId,
        'updatedName'
      );
      expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_401);
      expect(quizIdNotReferToUser.bodyString).toStrictEqual({
        error: expect.any(String),
      });
    });

    test('Error 403: QuizId does not refer to a quiz that this user owns', () => {
      const returnToken = requestAdminAuthLogin('jack@hotmail.com', '123456ab')
        .bodyString as Token;
      const returnToken2 = requestAdminAuthLogin('adam@hotmail.com', '123456ab')
        .bodyString as Token;
      const AdamQuizId = requestAdminQuizCreate(
        returnToken2.token,
        'Jess',
        'description'
      ).bodyString as QuizId;
      const quizIdNotReferToUser = requestAdminQuizNameUpdate(
        returnToken.token,
        AdamQuizId.quizId,
        'updatedName'
      );
      expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_403);
      expect(quizIdNotReferToUser.bodyString).toStrictEqual({
        error: expect.any(String),
      });
    });
  });
});

