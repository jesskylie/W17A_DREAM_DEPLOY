// Do not delete this file
import request from 'sync-request-curl';
import config from './config.json';

// assuming there are these functions in auth_2.test.ts (name could be change after finish writing auth_2.test.ts)
import { requestadminAuthRegister, requestadminAuthLogin } from './auth_2.test';
import { Quizzes, Users } from './dataStore';
import exp from 'constants';

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

const OK = 200;
const INPUT_ERROR = 400;
const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;


const requestClear = () => {
  const res = request('DELETE', SERVER_URL + `/clear`, { json: {} });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return {statusCode, bodyString};
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
    expect(res.statusCode).toBe(OK);
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
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

// I'm not sure what is the function name for auth functions so I just name them as same as quiz.test.ts shown
// probably need to change after finish auth_2.test.ts funcitons are done

// help funcitons: 
// if anyone know how to combine them to just one big function and muilt small fuctions like tut05/automarking
// feel free to change what I have here (requestadminQuizCreate and requestadminQuizInfo)
const requestadminQuizCreate = (authUserId: number, name: string, describption: string) => {
  const res = request('POST', SERVER_URL + `/v1/admin${authUserId}/quiz`, { json: {name, describption} });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return {statusCode, bodyString};
}
// Problem: authUserId should not be here, cuz should be login first
// But due to I'm not sure how login work so I'll leave them here first for 
// testing (make sure it can run)
const requestadminQuizInfo = (authUserId: number, quizId: number) => {
  const res = request('GET', SERVER_URL + `v1/admin${authUserId}/quiz/${quizId}`, { json: {} });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return {statusCode, bodyString};
}

const requestadminQuizRemove = (authUserId: number, quizId: number) => {
  const res = request('DELETE', SERVER_URL + `v1/admin${authUserId}/quiz/${quizId}`, { json: {} });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return {statusCode, bodyString};
}

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
    JackAuthUserId = requestadminAuthLogin(
      'jack@hotmail.com',
      '123456ab'
    );
    QuizOne = requestadminQuizCreate(
      JackUser.bodyString.authUserId,
      'Quiz One',
      'this is my first quiz'
    );
  })
  test('success print out quizInfo', () => {
    const quiz1Info = requestadminQuizInfo(JackUser.bodyString.authUserId, QuizOne.bodyString.quizId);
    expect(quiz1Info.statusCode).toBe(200);
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
    const quiz2Info = requestadminQuizInfo(JackUser.bodyString.authUserId, QuizTwo.bodyString.quizId);
    expect(quiz2Info.statusCode).toBe(200);
    expect(quiz2Info.bodyString).toStrictEqual({
      quizId: QuizTwo.bodyString.quizId,
      name: 'Quiz Two',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my second quiz',
    });
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const emptyQuizId = requestadminQuizInfo(JackUser.bodyString.authUserId, '');
    expect(emptyQuizId.statusCode).toBe(400);
    expect(emptyQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const invalidQuizId = requestadminQuizInfo(JackUser.bodyString.authUserId, 'S');
    expect(invalidQuizId.statusCode).toBe(400);
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
    const TonyQuiz = requestadminQuizCreate(TonyUser.bodyString.authUserId, 'Jack', 'Tony quiz');
    const quizIdNotReferToUser1 = requestadminQuizInfo(JackUser.bodyString.authUserId, TonyQuiz.bodyString.quizId);
    // not very sure it is refer to 403 or 400 error cuz in swagger it mentions in both
    expect(quizIdNotReferToUser1.statusCode).toBe(403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    const quizIdNotReferToUser2 = requestadminQuizInfo(TonyUser.bodyString.authUserId, QuizOne.bodyString.quizId);
    expect(quizIdNotReferToUser2.statusCode).toBe(403);
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
    const QuizId = requestadminQuizCreate(NewUser.bodyString.authUserId, 'Jess', 'description');
    const removeQuiz = requestadminQuizRemove(NewUser.bodyString.authUserId, QuizId.bodyString.quizId);
    expect(removeQuiz.statusCode).toBe(200);
    expect(removeQuiz.bodyString).toStrictEqual({});
    const checkQuizIsRemove = requestadminQuizCreate(NewUser.bodyString.authUserId, 'Jess', 'description');
    expect(checkQuizIsRemove.statusCode).toBe(200);
    expect(checkQuizIsRemove.bodyString).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Empty input', () => {
    const emptyQuizId = requestadminQuizRemove('', '');
    expect(emptyQuizId.statusCode).toBe(400);
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
    const QuizId = requestadminQuizCreate(NewUser.bodyString.authUserId, 'Jess', 'description');
    const invalidQuizId = requestadminQuizRemove(NewUser.bodyString.authUserId, 'abc');
    expect(invalidQuizId.statusCode).toBe(400);
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
    const quizIdNotReferToUser = requestadminQuizRemove(JessUser.bodyString.authUserId, AdamQuizId.bodyString.quizId);
    expect(quizIdNotReferToUser.statusCode).toBe(403);
    expect(quizIdNotReferToUser.bodyString).toStrictEqual({ error: expect.any(String) });
  });
});