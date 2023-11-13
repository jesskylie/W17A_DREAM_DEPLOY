/*
###########################################################################################
ROUTES TESTED IN THIS FILE
GET /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv -> requestGetLinkOfFinalResultsInCSV -> getQuizFinalResultCSV in src/session.ts
###########################################################################################
*/

import HTTPError from 'http-errors';
import {
  requestClear,
  requestAdminRegister,
  requestAdminQuizCreateV2,
  requestSessionStart,
  requestCreateQuestionV2,
  requestPlayerCreate,
  requestGetLinkOfFinalResultsInCSV,
  requestUpdateSessionState,
  requestGetQuizFinalResults,
  requestResultsOfAnswers,
  requestAnswerQuestion,
} from './library/route_testing_functions';
import { SessionId } from './quiz';
import { TokenString } from './library/interfaces';
import { DEFAULT_VALID_THUMBNAIL_URL } from './library/constants';

import { Action } from './dataStore';

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

describe('test /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv: Get quiz session final results in CSV format -> EXPECT 200 SUCCESS', () => {
  test('Get quiz session final results in CSV format -> EXPECT SUCESS CODE 200', () => {
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

    requestPlayerCreate(sessionId, playerName);

    const getLinkOfFinalResultsInCSV = requestGetLinkOfFinalResultsInCSV(
      quizId,
      sessionId,
      token
    );

    expect(getLinkOfFinalResultsInCSV).toStrictEqual({
      url: expect.any(String),
    });
  });
});

describe('test /v1/admin/quiz/{quizid}/session/{sessionid}/results/csv: Get quiz session final results in CSV format -> EXPECT ERROR 400', () => {
  test('Session Id does not refer to valid session within this quiz - 400 error', () => {
    requestClear();
    const result = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const quizId = requestAdminQuizCreateV2(
      result.body.token,
      'New Quiz',
      'Quiz description'
    );
    const questionOne = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Prince Henry',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Prince Charles',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
    requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.NEXT_QUESTION
    );
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.SKIP_COUNTDOWN
    );

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_ANSWER
    );
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_FINAL_RESULTS
    );
    expect(() =>
      requestGetQuizFinalResults(quizId.quizId, -1, result.body.token)
    ).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state - 400 er', () => {
    requestClear();
    const result = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const quizId = requestAdminQuizCreateV2(
      result.body.token,
      'New Quiz',
      'Quiz description'
    );
    const questionOne = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Prince Henry',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Prince Charles',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
    requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.NEXT_QUESTION
    );
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.SKIP_COUNTDOWN
    );

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_ANSWER
    );
    requestResultsOfAnswers(playerIdOne.playerId, 0);
    expect(() =>
      requestGetQuizFinalResults(quizId.quizId, -1, result.body.token)
    ).toThrow(HTTPError[400]);
  });

  test('Token is empty/invalid - 401 error', () => {
    requestClear();
    const result = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const quizId = requestAdminQuizCreateV2(
      result.body.token,
      'New Quiz',
      'Quiz description'
    );
    const questionOne = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Prince Henry',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Prince Charles',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
    requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.NEXT_QUESTION
    );
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.SKIP_COUNTDOWN
    );

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_ANSWER
    );
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_FINAL_RESULTS
    );
    expect(() =>
      requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, 'abcde')
    ).toThrow(HTTPError[401]);
    expect(() =>
      requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, '')
    ).toThrow(HTTPError[401]);
  });

  test('Token is empty/invalid - 403 error', () => {
    requestClear();
    const result = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const resultTwo = requestAdminRegister(
      'jacob@hotmail.com',
      '12345abced',
      'Jacob',
      'Berry'
    );
    const quizId = requestAdminQuizCreateV2(
      result.body.token,
      'New Quiz',
      'Quiz description'
    );
    const questionOne = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Prince Henry',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Prince Charles',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
    requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.NEXT_QUESTION
    );
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.SKIP_COUNTDOWN
    );

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_ANSWER
    );
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.GO_TO_FINAL_RESULTS
    );
    expect(() =>
      requestGetQuizFinalResults(
        quizId.quizId,
        sessionId.sessionId,
        resultTwo.body.token
      )
    ).toThrow(HTTPError[403]);
  });
});
