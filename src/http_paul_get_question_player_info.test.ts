/*
###########################################################################################
ROUTES TESTED IN THIS FILE
GET /v1/player/{playerid}/question/{questionposition} -> playerQuestionPositionInfo in src/player_info.ts -> requestPlayerQuestionPositionInfo
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
  requestCurrentQuestionInformationForPlayer,
} from './library/route_testing_functions';
import { TokenString, GetSessionStatusReturnObj } from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  DEFAULT_VALID_THUMBNAIL_URL,
} from './library/constants';
import { playerStatus } from './session';

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

describe('test /v1/{playerid}/question/{questionposition}: Returns information about the player -> EXPECT 200 SUCCESS', () => {
  test('Returns question information for a player -> EXPECT SUCESS CODE 200', () => {
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

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    const sessionId = testCreateSession.sessionId;

    const getExpectedQuestionInformatinForPlayerObj = {
      questionId: expect.any(Number),
      question: expect.any(String),
      duration: expect.any(Number),
      thumbnailUrl: expect.any(String),
      points: expect.any(Number),
      answers: expect.any(Array),
    };

    // create player

    const playerName = 'Paul Reynolds';

    const playerIdObj = requestPlayerCreate(sessionId, playerName);

    // get status of guest player in session
    // returns { state: 'LOBBY', numQuestions: 1, atQuestion: 3 }
    // need question postion 'atQuestion'

    const statusOfPlayerObj = playerStatus(playerIdObj.playerId);

    const getQuestionInfoForPlayer = requestCurrentQuestionInformationForPlayer(
      playerIdObj.playerId,
      statusOfPlayerObj.atQuestion
    );

    expect(getQuestionInfoForPlayer).toStrictEqual(
      getExpectedQuestionInformatinForPlayerObj
    );
  });
});

describe('test /v1/{playerid}/question/{questionposition}: Error cases -> EXPECT ERROR 400', () => {
  test('If player ID does not exist -> EXPECT ERROR CODE 400', () => {
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

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    const sessionId = testCreateSession.sessionId;

    // create player

    const playerName = 'Paul Reynolds';

    const playerIdObj = requestPlayerCreate(sessionId, playerName);

    requestAdminGetSessionStatus(quizId, sessionId, token) as
      | unknown
      | GetSessionStatusReturnObj;

    // get status of guest player in session
    // returns { state: 'LOBBY', numQuestions: 1, atQuestion: 3 }
    // need question postion 'atQuestion'

    const statusOfPlayerObj = playerStatus(playerIdObj.playerId);

    expect(() =>
      requestCurrentQuestionInformationForPlayer(
        -playerIdObj.playerId,
        statusOfPlayerObj.atQuestion
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test.skip('If question position is not valid for the session this player is in -> EXPECT ERROR CODE 400', () => {
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

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    const sessionId = testCreateSession.sessionId;

    // create player

    const playerName = 'Paul Reynolds';

    const playerIdObj = requestPlayerCreate(sessionId, playerName);

    requestAdminGetSessionStatus(quizId, sessionId, token) as
      | unknown
      | GetSessionStatusReturnObj;

    // get status of guest player in session
    // returns { state: 'LOBBY', numQuestions: 1, atQuestion: 3 }
    // need question postion 'atQuestion'

    const statusOfPlayerObj = playerStatus(playerIdObj.playerId);

    expect(() =>
      requestCurrentQuestionInformationForPlayer(
        playerIdObj.playerId,
        -statusOfPlayerObj.atQuestion
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('If session is not currently on this question -> EXPECT ERROR CODE 400', () => {
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

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    const sessionId = testCreateSession.sessionId;

    // create player

    const playerName = 'Paul Reynolds';

    const playerIdObj = requestPlayerCreate(sessionId, playerName);

    requestAdminGetSessionStatus(quizId, sessionId, token) as
      | unknown
      | GetSessionStatusReturnObj;

    // get status of guest player in session
    // returns { state: 'LOBBY', numQuestions: 1, atQuestion: 3 }
    // need question postion 'atQuestion'

    const statusOfPlayerObj = playerStatus(playerIdObj.playerId);

    expect(() =>
      requestCurrentQuestionInformationForPlayer(
        playerIdObj.playerId,
        statusOfPlayerObj.atQuestion + 1
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test.skip('Session is in LOBBY or END state -> EXPECT ERROR CODE 400', () => {
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

    // create session

    const testCreateSession = requestSessionStart(quizId, token, 1);

    const sessionId = testCreateSession.sessionId;

    // create player

    const playerName = 'Paul Reynolds';

    const playerIdObj = requestPlayerCreate(sessionId, playerName);

    requestAdminGetSessionStatus(quizId, sessionId, token) as
      | unknown
      | GetSessionStatusReturnObj;

    // get status of guest player in session
    // returns { state: 'LOBBY', numQuestions: 1, atQuestion: 3 }
    // need question postion 'atQuestion'

    const statusOfPlayerObj = playerStatus(playerIdObj.playerId);

    expect(() =>
      requestCurrentQuestionInformationForPlayer(
        playerIdObj.playerId,
        statusOfPlayerObj.atQuestion
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });
});
