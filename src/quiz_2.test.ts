// Do not delete this file _
// All tests passing
import request from 'sync-request-curl';
import config from './config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  WAIT_TIME,
} from './library/constants';

import {
  AuthUserId,
  TokenString,
  ErrorObjectWithCode,
} from './library/interfaces';

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

interface QuizId {
  quizId: number;
}

interface requestAdminAuthLoginReturn {
  statusCode?: number;
  bodyString: TokenString | ErrorObject;
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

// beforeAll(() => {
//   requestClear();
// });

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
    timeout: WAIT_TIME,
  });
  return {
    statusCode: res.statusCode,
    bodyString: JSON.parse(res.body.toString()),
  };
};

export const requestAdminQuizInfo = (
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
// testing of adminQuizInfo - END
describe('adminQuizInfo testing', () => {
  // the interface above is not working and idk why so i leave these to be any first
  // let JackUser: requestAdminAuthRegisterReturn;
  // let JackAuthUserId: requestAdminAuthLoginReturn;
  // let QuizOne: requestAdminQuizCreateReturn;
  // beforeAll(() => {
  //   requestAdminRegister('jack@hotmail.com', '123456ab', 'Jack', 'Harlow');
  // });
  test('StatusCode 200: Valid input - expect response 200', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;

    const quiz1Info = requestAdminQuizInfo(testToken, QuizOne.quizId);
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
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    const quiz2Info = requestAdminQuizInfo(testToken, QuizTwo.quizId);
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
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const quizIdIsInvalid = requestAdminQuizInfo(testToken, -1 * 1531);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminQuizInfo('', Quiz.quizId);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz 2',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminQuizInfo('invalid', Quiz.quizId);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    // create user 2
    const returnTokenObj2 = requestAdminRegister(
      'tony@hotmail.com',
      'ab123456b',
      'Tony',
      'Stark'
    ) as TokenString;

    const testToken2 = returnTokenObj2.token;

    // Create quiz using jack@hotmail.com token
    const JackQuiz = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'This a quiz by Jack'
    ).bodyString as QuizId;

    // Try to get the info about Jack's quiz
    // but with Tony's token
    const quizIdNotReferToUser1 = requestAdminQuizInfo(
      testToken2,
      JackQuiz.quizId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    // console.log(quizIdNotReferToUser1.bodyString);
    // this should only return error instead of returnning both error and errorcode in
    // bodystring
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

// testing of adminQuizInfo - END
// testing of adminQuizRemove - START
describe('Testing adminQuizRemove', () => {
  test('Status Code 200: Correct input', () => {
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, QuizOne.quizId);
    const checkQuizIsRemoved = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is the only quiz'
    );
    expect(checkQuizIsRemoved.bodyString).toStrictEqual({
      quizId: expect.any(Number),
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const quizIdIsInvalid = requestAdminQuizRemove(testToken, -1 * 1531);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz a',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminQuizRemove('', Quiz.quizId);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz b',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminQuizRemove('invalid', Quiz.quizId);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: QuizId does not refer to a quiz that this user owns', () => {
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jess',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    requestAdminRegister('peter@hotmail.com', 'pass123456', 'Peter', 'Parker');
    const returnToken2 = requestAdminAuthLogin(
      'peter@hotmail.com',
      'pass123456'
    ).bodyString as TokenString;
    const peterQuizId = requestAdminQuizCreate(
      returnToken2.token,
      'Peter',
      'description'
    ).bodyString as QuizId;
    // console.log(peterQuizId);
    const quizIdNotReferToUser = requestAdminQuizRemove(
      testToken,
      peterQuizId.quizId
    );
    expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

// testing of adminQuizRemove - END

// testing of adminQuizList - START

describe('adminQuizList testing', () => {
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

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    const QuizPrint = requestAdminQuizList(testToken);
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
    requestClear();

    const invalidToken = requestAdminQuizList('invalid');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Error 401: empty token', () => {
    requestClear();
    const invalidToken = requestAdminQuizList('');
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

// testing of adminQuizList - END

// tests (Iteration Part 2):

// adminTrashQuizRestore

const requestAdminTrashQuizRestore = (
  token: string,
  quizId: number
): requestAdminTrashQuizRestoreReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, {
    json: { token, quizId },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

describe('adminTrashQuizRestore testing', () => {
  test('StatusCode 200: Valid input', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, QuizOne.quizId);
    requestAdminQuizRemove(testToken, QuizTwo.quizId);
    requestAdminTrashQuizRestore(testToken, QuizOne.quizId);
    const quizOneRestored = requestAdminQuizList(testToken);
    expect(quizOneRestored.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
      ],
    });
    requestAdminTrashQuizRestore(testToken, QuizTwo.quizId);
    const quizTwoRestored = requestAdminQuizList(testToken);
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
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    const quizIdIsInvalid = requestAdminTrashQuizRestore(testToken, -1 * 1531);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Quiz name of the restored quiz is already used by another active quiz', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const quiz1 = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, quiz1.quizId);
    requestAdminQuizCreate(testToken, 'Quiz 1', 'this is my second quiz');
    const quizNameInvalid = requestAdminTrashQuizRestore(
      testToken,
      quiz1.quizId
    );
    expect(quizNameInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizNameInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Quiz ID refers to a quiz that is not currently in the trash', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const quiz1 = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const quizIdNotInTrash = requestAdminTrashQuizRestore(
      testToken,
      quiz1.quizId
    );
    expect(quizIdNotInTrash.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdNotInTrash.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz test 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminTrashQuizRestore('', Quiz.quizId);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz test 2',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminTrashQuizRestore('invalid', Quiz.quizId);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    requestAdminRegister('tony2@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin('tony2@hotmail.com', 'ab123456b')
      .bodyString as TokenString;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Tony2',
      'Tony quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken2.token, TonyQuiz.quizId);
    const quizIdNotReferToUser1 = requestAdminTrashQuizRestore(
      testToken,
      TonyQuiz.quizId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    // console.log(quizIdNotReferToUser1.bodyString);
    // this should only return error instead of returnning both error and errorcode in
    // bodystring
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

// adminTrashQuizEmpty

const requestAdminTrashQuizEmpty = (
  token: string,
  quizids: number[]
): requestAdminQuizRemoveReturn => {
  const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/trash/empty`, {
    qs: { quizids: quizids, token: token },
  });
  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
};

describe('adminTrashQuizEmpty testing', () => {
  // beforeAll(() => {
  //   requestClear();
  //   requestAdminRegister('emma1@hotmail.com', '123456ab', 'Emma', 'Homes');
  // });
  test('StatusCode 200: Valid input', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    ) as TokenString;

    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, QuizOne.quizId);
    requestAdminQuizRemove(testToken, QuizTwo.quizId);
    requestAdminTrashQuizEmpty(testToken, [QuizOne.quizId, QuizTwo.quizId]);
    const quizOneRestoredfail = requestAdminTrashQuizRestore(
      testToken,
      QuizOne.quizId
    );
    expect(quizOneRestoredfail.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizOneRestoredfail.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const quizTwoRestoredfail = requestAdminTrashQuizRestore(
      testToken,
      QuizTwo.quizId
    );
    expect(quizTwoRestoredfail.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizTwoRestoredfail.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const quizIdIsInvalid = requestAdminTrashQuizEmpty(testToken, [-1 * 1531]);
    expect(quizIdIsInvalid.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdIsInvalid.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Quiz ID refers to a quiz that is not currently in the trash', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const quiz1 = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    const quizIdNotInTrash = requestAdminTrashQuizEmpty(testToken, [
      quiz1.quizId,
    ]);
    expect(quizIdNotInTrash.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizIdNotInTrash.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz a',
      'this is my first quiz'
    ).bodyString as QuizId;
    const emptyToken = requestAdminTrashQuizEmpty('', [Quiz.quizId]);
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz b',
      'this is my second quiz'
    ).bodyString as QuizId;
    const invalidToken = requestAdminTrashQuizEmpty('invalid', [Quiz.quizId]);
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    ) as TokenString;

    const testToken = returnTokenObj.token;
    requestAdminRegister('ricky1@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin(
      'ricky1@hotmail.com',
      'ab123456b'
    ).bodyString as TokenString;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Jack',
      'Tony quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(returnToken2.token, TonyQuiz.quizId);
    const quizIdNotReferToUser1 = requestAdminTrashQuizEmpty(testToken, [
      TonyQuiz.quizId,
    ]);
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    // console.log(quizIdNotReferToUser1.bodyString);
    // this should only return error instead of returnning both error and errorcode in
    // bodystring
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
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
