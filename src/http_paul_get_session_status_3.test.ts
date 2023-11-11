/*
###########################################################################################
ROUTES TESTED IN THIS FILE
GET /v1/admin/quiz/{quizid}/session/{sessionid} -> adminGetSessionStatus in src/quizV2.ts -> requestAdminGetSessionStatus
###########################################################################################
*/

import HTTPError from 'http-errors';
import {
  requestClear,
  requestAdminRegister,
  requestAdminQuizCreateV2,
  requestAdminGetSessionStatus,
  requestSessionStart,
  requestCreateQuestionV2,
  requestPlayerCreate,
} from './library/route_testing_functions';
import { TokenString } from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  DEFAULT_VALID_THUMBNAIL_URL,
} from './library/constants';

// --------------------------------------------------
// Test suite for POST /v2/admin/auth/logout route - START

// constants used in this file - START

const emailBase = 'paulemail3@gmail.com';
const passwordBase = 'password123456789';

// constants used in this file - END

// functions used in this file - START

// functions used in this file - END

// interfaces used in this file - START

interface RequestAdminRegisterReturn {
  body: TokenString;
  status: number;
}

// interfaces used in this file - END

const question = {
  question: 'Who is the monarch of England?',
  duration: 1,
  points: 5,
  answers: [
    {
      answer: 'King Charles',
      correct: true,
      colour: 'red',
      answerId: 1,
    },
    {
      answer: 'Prince William',
      correct: false,
      colour: 'red',
      answerId: 2,
    },
  ],
  thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
};

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

// parameters

// quizid (path) number
// sessionid (path) number
// token (header) string

describe.only('test /v1/admin/quiz/{quizid}/session/{sessionid}: Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns data about session state -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    const quizName = 'New Quiz';
    const quizDescription = 'Description of quiz';

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      quizName,
      quizDescription
    );

    const quizId = quizCreateResponse.quizId;

    // create question

    requestCreateQuestionV2(token, question, quizId);

    // console.log('200 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    // console.log('200 test: testCreateSession ->', testCreateSession);

    const sessionId = testCreateSession.sessionId;

    // console.log('200 test: sessionId ->', sessionId);

    // create player

    const playerName = 'Paul Reynolds';

    requestPlayerCreate(sessionId, playerName);

    const testGetSessionStatus = requestAdminGetSessionStatus(
      quizId,
      sessionId,
      token
    );

    // const getExpectedSessionState = createSessionStateObject({
    //   state:'LOBBY',
    //   atQuestion:1,
    //   players: ['Hayden'],
    //   metadata: {
    //   quizId: quizId,
    //   name: quizName,
    //   timeCreated: expect.any(Number),
    //   description: expect.any(String),
    //   numQuestions: expect.any(Number),
    //   questions: []
    //   duration: expect.any(Number),
    //   thumbnailUrl: expect.any(String),
    //   }}
    // );

    const getExpectedSessionState = {
      state: 'lobby',
      atQuestion: expect.any(Number),
      players: [playerName],
      metadata: {
        quizId: quizId,
        name: quizName,
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number),
        thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
      },
    };

    // console.log('200 test: testGetSessionStatus ->', testGetSessionStatus);
    // console.log('200 test: getExpectedSessionState', getExpectedSessionState);
    expect(testGetSessionStatus).toStrictEqual(getExpectedSessionState);
  });
});

describe('test /v1/admin/quiz/{quizid}/session/{sessionid}: EXPECT ERROR 400 | 401 | 403', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session) -> EXPECT ERROR CODE 401', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    requestCreateQuestionV2(token, question, quizId);

    // console.log('401 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    // console.log('401 test: testCreateSession ->', testCreateSession);

    const sessionId = testCreateSession.sessionId;

    // test for get session status

    expect(() => requestAdminGetSessionStatus(quizId, sessionId, '')).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Valid token is provided, but user is not authorised to view this session -> EXPECT ERROR CODE 403', () => {
    // NOT POSSIBLE UNTIL player is created
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    const email2 = 'wrongtoken@gmail.com';
    const nameFirst2 = 'Wrong';
    const nameLast2 = 'Token';

    const testRegister2 = requestAdminRegister(
      email2,
      password,
      nameFirst2,
      nameLast2
    ) as RequestAdminRegisterReturn;

    const tokenNotAuthorisedToView = testRegister2.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    requestCreateQuestionV2(token, question, quizId);

    // console.log('403 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    // console.log('403 test: testCreateSession ->', testCreateSession);

    const sessionId = testCreateSession.sessionId;

    // test for get session status

    expect(() =>
      requestAdminGetSessionStatus(quizId, sessionId, tokenNotAuthorisedToView)
    ).toThrow(HTTPError[RESPONSE_ERROR_403]);
  });

  test('Session Id does not refer to a valid session within this quiz -> EXPECT ERROR CODE 400', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    requestCreateQuestionV2(token, question, quizId);

    // console.log('400 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    requestSessionStart(quizId, token, 1);

    // console.log('400 test: testCreateSession ->', testCreateSession);

    // const sessionId = testCreateSession.sessionId;

    // test for get session status

    expect(() => requestAdminGetSessionStatus(quizId, 123456, token)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });
});
