import { DEFAULT_VALID_THUMBNAIL_URL } from './library/constants';
import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestAnswerQuestion,
  requestClear,
  requestCreateQuestionV2,
  requestPlayerCreate,
  requestPlayerStatus,
  requestResultsOfAnswers,
  requestSessionFinalResult,
  requestSessionStart,
  requestUpdateSessionState,
} from './library/route_testing_functions';
import { SessionId } from './quiz';
import { Action, State } from './dataStore';
import { sleepSync } from './library/functions';

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
      5
    ) as SessionId;
    expect(requestPlayerCreate(sessionId.sessionId, '')).toStrictEqual({
      playerId: expect.any(Number),
    });
    expect(requestPlayerCreate(sessionId.sessionId, 'valid')).toStrictEqual({
      playerId: expect.any(Number),
    });
  });

  test('Name of user entered is not unique (compared to other users who have already joined)', () => {
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
      5
    ) as SessionId;
    requestPlayerCreate(sessionId.sessionId, 'repeated');
    expect(() => requestPlayerCreate(sessionId.sessionId, 'repeated')).toThrow(
      HTTPError[400]
    );
  });

  test('Session is not in LOBBY state', () => {
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
      5
    ) as SessionId;
    requestUpdateSessionState(
      quizId.quizId,
      sessionId.sessionId,
      result.body.token,
      Action.END
    );
    expect(() => requestPlayerCreate(sessionId.sessionId, 'valid')).toThrow(
      HTTPError[400]
    );
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
      5
    ) as SessionId;
    const playerId = requestPlayerCreate(sessionId.sessionId, '');
    expect(requestPlayerStatus(playerId.playerId)).toStrictEqual({
      state: State.LOBBY,
      numQuestions: 1,
      atQuestion: 0
    });
  });

  test('player ID does not exist - error 400', () => {
    requestClear();
    expect(() => requestPlayerStatus(-1531)).toThrow(HTTPError[400]);
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
    const questionId = requestCreateQuestionV2(result.body.token, question, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const playerId1 = requestPlayerCreate(sessionId.sessionId, 'W');
    const playerId2 = requestPlayerCreate(sessionId.sessionId, 'L');
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);
    sleepSync(1000);
    requestAnswerQuestion(playerId1.playerId, [0], 1);
    sleepSync(1000);
    requestAnswerQuestion(playerId2.playerId, [1], 1);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerId1.playerId, 1);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS);
    expect(requestSessionFinalResult(playerId1.playerId)).toStrictEqual({
      usersRankedByScore: [
        {
          name: 'W',
          score: 5
        },
        {
          name: 'L',
          score: 0
        }
      ],
      questionResults: [
        {
          questionId: questionId.questionId,
          playersCorrectList: [
            'W'
          ],
          averageAnswerTime: 2,
          percentCorrect: 50
        }
      ]
    });
  });

  test('player ID does not exist - error 400', () => {
    requestClear();
    expect(() => requestSessionFinalResult(-1531)).toThrow(HTTPError[400]);
  });
  test('Session is not in FINAL_RESULTS state - error 400', () => {
    requestClear();
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
      5
    ) as SessionId;
    const playerId1 = requestPlayerCreate(sessionId.sessionId, 'W');
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);
    expect(() => requestSessionFinalResult(playerId1.playerId)).toThrow(HTTPError[400]);
  });
});
