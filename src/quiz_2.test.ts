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

const requestadminAuthLogin = (
  email: string,
  password: string
): RequestAdminAuthLoginReturn => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password },
  });
  const bodyString = JSON.parse(res.body.toString());
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyObject);
  } catch (error: any) {
    bodyObject = {
      error: bodyString,
    };
  }
  if ('error' in bodyObject) {
    return { statusCode: res.statusCode, ...bodyObject };
  }
  return bodyObject;
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
/*
// Helper functions:

const requestadminQuizCreate = (
  token: string,
  name: string,
  describption: string
): RequestAdminQuizCreateReturn => {
  const res = request('POST', SERVER_URL + `/v1/admin/quiz`, {
    json: { token, name, describption },
  });
  const bodyString = JSON.parse(res.body.toString());
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyObject);
  } catch (error: any) {
    bodyObject = {
      error: bodyString
    };
  }
  if ('error' in bodyObject) {
    return { statusCode: res.statusCode, ...bodyObject };
  }
  return bodyString;
};

const requestadminQuizInfo = (token: string, quizid: number): RequestAdminQuizInfoReturn => {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin/quiz/${quizid}`,
    { json: { quizid, token } }
  );
  const bodyString = JSON.parse(res.body.toString());
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyObject);
  } catch (error: any) {
    bodyObject = {
      error: bodyString
    };
  }
  if ('error' in bodyObject) {
    return { statusCode: res.statusCode, ...bodyObject };
  }
  return bodyObject;
};

const requestadminQuizRemove = (token: string, quizid: number): RequestAdminQuizRemoveReturn => {
  const res = request(
    'DELETE',
    SERVER_URL + `v1/admin/quiz/${quizid}`,
    { json: { quizid, token } }
  );
  const bodyString = JSON.parse(res.body.toString());
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyObject);
  } catch (error: any) {
    bodyObject = {
      error: bodyString
    };
  }
  if ('error' in bodyObject) {
    return { statusCode: res.statusCode, ...bodyObject };
  }
  return bodyObject;
};

const requestadminQuizList = (token: string): RequestAdminQuizListReturn => {
  const res = request(
    'GET',
    SERVER_URL + `v1/admin/quiz/list`,
    { json: { token } }
  );
  const bodyString = JSON.parse(res.body.toString());
  let bodyObject: any;
  try {
    bodyObject = JSON.parse(bodyObject);
  } catch (error: any) {
    bodyObject = {
      error: bodyString
    };
  }
  if ('error' in bodyObject) {
    return { statusCode: res.statusCode, ...bodyObject };
  }
  return bodyObject;
};

// tests:
describe('adminQuizInfo testing', () => {
  // the interface above is not working and idk why so i leave these to be any first
  // let JackUser: RequestAdminAuthRegisterReturn;
  // let JackAuthUserId: RequestadminAuthLoginReturn;
  // let QuizOne: RequestadminQuizCreateReturn;
  beforeAll(() => {
    requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
  });
  test('StatusCode 200: Valid input', () => {
    let returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    let QuizOne = requestadminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const quiz1Info = requestadminQuizInfo(
      returnToken.token,
      QuizOne.quizId
    );
    // there are objects 'duration' & 'numQuestion' & 'question' didn't add in it
    expect(quiz1Info.bodyString).toStrictEqual({
      quizId: QuizOne.quizId,
      name: 'Quiz One',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my first quiz',
    });

    const QuizTwo = requestadminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    const quiz2Info = requestadminQuizInfo(
      returnToken.token,
      QuizTwo.quizId
    );
    expect(quiz2Info.bodyString).toStrictEqual({
      quizId: QuizTwo.quizId,
      name: 'Quiz Two',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my second quiz',
    });
  });

  test('Error 400: empty QuizId and invalid QuizId', () => {
    let returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    const emptyQuizId = requestadminQuizInfo(
      returnToken.token,
      ''
    );
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const invalidQuizId = requestadminQuizInfo(
      returnToken.token,
      'S'
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    requestAdminRegister(
      'tony@hotmail.com',
      'ab123456b',
      'Tony',
      'Stark'
    );
    const returnToken2 = requestadminAuthLogin(
      'tony@hotmail.com',
      'ab123456b'
    ).bodyString as Token;
    const TonyQuiz = requestadminQuizCreate(
      returnToken2.token,
      'Jack',
      'Tony quiz'
    ).bodyString as QuizId;
    const quizIdNotReferToUser1 = requestadminQuizInfo(
      returnToken.token,
      TonyQuiz.quizId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe('Testing adminQuizRemove', () => {
  beforeAll(() => {
    adminAuthRegister(
      'jess@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
  })
  test('Status Code 200: Correct input', () => {
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    const QuizOne = requestadminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    requestadminQuizRemove(
      returnToken.token, 
      QuizOne.quizId
      );
    const checkQuizIsRemoved = requestadminQuizCreate(
      returnToken.token,
      'Quiz Check',
      'this is the only quiz'
    );
    expect(checkQuizIsRemoved.bodyString).toStrictEqual({
      quizId: expect.any(Number),
    });
  });

  test('Error 400: Empty input for QuizId', () => {
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    const emptyQuizId = requestadminQuizRemove(
      returnToken.token, 
      ''
    );
    expect(emptyQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: Invalid QuizId', () => {
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    const invalidQuizId = requestadminQuizRemove(
      returnToken.token,
      'abc'
    );
    expect(invalidQuizId.statusCode).toBe(400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: QuizId does not refer to a quiz that this user owns', () => {
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    const returnToken2 = requestadminAuthLogin('adam@hotmail.com', '123456ab').bodyString as Token;
    const AdamQuizId = requestadminQuizCreate(
      returnToken2.token,
      'Jess',
      'description'
    ).bodyString as QuizId;
    const quizIdNotReferToUser = requestadminQuizRemove(
      returnToken.token,
      AdamQuizId.quizId
    );
    expect(quizIdNotReferToUser.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe('adminQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );
    const returnToken = requestadminAuthLogin('jack@hotmail.com', '123456ab').bodyString as Token;
    const QuizOne = requestadminQuizCreate(
      returnToken.token,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestadminQuizCreate(
      returnToken.token,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    const QuizPrint = requestadminQuizList(returnToken.token);
    expect(QuizPrint.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'this is my first quiz',
        },
        {
          quizId: QuizTwo.quizId,
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
*/
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
