import { DEFAULT_VALID_THUMBNAIL_URL } from './library/constants';
import HTTPError from 'http-errors';
import { requestAdminQuizCreateV2, requestAdminRegister, requestAnswerQuestion, requestClear, requestCreateQuestionV2, requestPlayerCreate, requestPlayerStatus, requestSessionFinalResult, requestSessionStart, requestUpdateSessionState } from './library/route_testing_functions';
import { SessionId } from './quiz';
import { Action } from './dataStore';

describe('Test: POST /v1/player/join', () => {
  test('Success - valid input', () => {
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
    const question = {
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
    requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
    expect(requestPlayerCreate(sessionId.sessionId, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(requestPlayerCreate(sessionId.sessionId, 'valid')).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('Name of user entered is not unique (compared to other users who have already joined) - error 400', () => {
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
    const question = {
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
    requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
    requestPlayerCreate(sessionId.sessionId, 'repeated');
    expect(() => requestPlayerCreate(sessionId.sessionId, 'repeated')).toThrow(HTTPError[400]);
  });

  test('Session is not in LOBBY state - error 400', () => {
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
    const question = {
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
    requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.END);
    expect(() => requestPlayerCreate(sessionId.sessionId, 'valid')).toThrow(HTTPError[400]);
  });
});

describe('Test: GET /v1/player/{playerid}', () => {
  test('Success - valid input', () => {
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
    const question = {
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
    requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
    const playerId1 = requestPlayerCreate(sessionId.sessionId, '');
    const playerId2 = requestPlayerCreate(sessionId.sessionId, 'valid');
    expect(requestPlayerStatus(playerId1.playerId)).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 1,
      atQuestion: 0
    });
    expect(requestPlayerStatus(playerId2.playerId)).toStrictEqual({
      state: 'LOBBY',
      numQuestions: 1,
      atQuestion: 0
    });
  });

  test('PlayerId does not exist - error 400', () => {
    requestClear();
    expect(() => requestPlayerStatus(0)).toThrow(HTTPError[400]);
  });
});

describe('Test: GET /v1/player/{playerid}/results', () => {
  test('Success - valid input', () => {
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
    const question = {
      question: 'Who is the Monarch of England?',
      duration: 2,
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
    const questionId = requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      3) as SessionId;
    const playerId1 = requestPlayerCreate(sessionId.sessionId, '');
    const playerId2 = requestPlayerCreate(sessionId.sessionId, 'valid');
    const playerId3 = requestPlayerCreate(sessionId.sessionId, '');
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);
    requestAnswerQuestion(playerId1.playerId, 0, 1);
    requestAnswerQuestion(playerId2.playerId, 1, 1);
    requestAnswerQuestion(playerId3.playerId, 0, 1);
    setTimeout(() => requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS), 2000);
    expect(requestSessionFinalResult(playerId1.playerId)).toStrictEqual({
      usersRankedByScore: [
        {
          name: expect.any(String),
          score: 5
        },
        {
          name: expect.any(String),
          score: 5
        },
        {
          name: 'valid',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId.questionId,
          playersCorrectList: [
            expect.any(String),
            expect.any(String),
          ],
          averageAnswerTime:  expect.any(Number),
          percentCorrect: 66
        }
      ]
    });
  });

  test('PlayerId does not exist - error 400', () => {
    requestClear();
    expect(() => requestSessionFinalResult(0)).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state - valid input', () => {
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
    const question = {
      question: 'Who is the Monarch of England?',
      duration: 2,
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
    requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      3) as SessionId;
    const playerId1 = requestPlayerCreate(sessionId.sessionId, '');
    expect(() => requestSessionFinalResult(playerId1.playerId)).toThrow(HTTPError[400]);
  });
});
