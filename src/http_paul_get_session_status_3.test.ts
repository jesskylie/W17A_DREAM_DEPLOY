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
  requestAdminUpdateQuizThumbnail,
  requestAdminQuizInfoV2,
  requestAdminGetSessionStatus,
  requestSessionStart,
  requestCreateQuestionV2,
} from './library/route_testing_functions';
import {
  QuestionBody,
  TokenString,
  requestAdminQuizInfoReturn,
} from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  DEFAULT_VALID_THUMBNAIL_URL,
  VALID_THUMBNAIL_URL,
  INVALID_THUMBNAIL_URL_NOT_A_FILE,
  INVALID_THUMBNAIL_URL_NOT_JPG_PNG,
} from './library/constants';

import { QuizzesCopy, Question } from './dataStore';
import { ExperimentalSpecifierResolution } from 'ts-node';

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

// interface PlayersArray {
//   players: string[];
// }

// interface SessionMetaDataObject {
//   metadata: Quizzes;
// }

// interface SessionStateObject {
//   user: {
//     authUserId: number;
//     name: string;
//     email: string;
//     numSuccessfulLogins: number;
//     numFailedPasswordsSinceLastLogin: number;
//   };
// }

function createSessionStateObject(
  state: string,
  atQuestion: number,
  players: string[],
  quizId: number,
  name: string,
  timeCreated: number,
  timeLastEdited: number,
  description: string,
  numQuestions: number,
  questions: Question,
  duration: number,
  thumbnailUrl: string
) {
  const expectedSessionStateObject = {
    state,
    atQuestion,
    players,
    quizId,
    name,
    timeCreated,
    timeLastEdited,
    description,
    numQuestions,
    questions,
    duration,
    thumbnailUrl,
  };

  return expectedSessionStateObject;
}

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

describe('test /v1/admin/quiz/{quizid}/session/{sessionid}: Returns an empty object -> EXPECT 200 SUCCESS', () => {
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

    const exemplarQuestion = {
      questionId: 1,
      question: 'Who is the monarch of England?',
      duration: 1,
      points: 5,
      answers: [
        {
          answerId: 1,
          answer: 'King Charles',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 2,
          answer: 'Prince William',
          colour: 'red',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };

    const testCreateQuestion = requestCreateQuestionV2(token, question, quizId);

    console.log('200 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    console.log('200 test: testCreateSession ->', testCreateSession);

    const sessionId = testCreateSession.sessionId;

    const testGetSessionStatus = requestAdminGetSessionStatus(
      quizId,
      sessionId,
      token
    );

    const getExpectedSessionState = createSessionStateObject(
      'LOBBY',
      1,
      ['Hayden'],
      quizId,
      quizName,
      expect.any(Number),
      expect.any(Number),
      quizDescription,
      1,
      exemplarQuestion,
      expect.any(Number),
      expect.any(String)
    );

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

    const testCreateQuestion = requestCreateQuestionV2(token, question, quizId);

    console.log('401 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    console.log('401 test: testCreateSession ->', testCreateSession);

    const sessionId = testCreateSession.sessionId;

    // test for get session status

    expect(() => requestAdminGetSessionStatus(quizId, sessionId, '')).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Valid token is provided, but user is not authorised to view this session -> EXPECT ERROR CODE 403', () => {
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

    const testCreateQuestion = requestCreateQuestionV2(token, question, quizId);

    console.log('403 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    console.log('403 test: testCreateSession ->', testCreateSession);

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

    const testCreateQuestion = requestCreateQuestionV2(token, question, quizId);

    console.log('400 test: testCreateQuestion ->', testCreateQuestion);

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    console.log('400 test: testCreateSession ->', testCreateSession);

    const sessionId = testCreateSession.sessionId;

    // test for get session status

    expect(() => requestAdminGetSessionStatus(quizId, 123456, token)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });
});
