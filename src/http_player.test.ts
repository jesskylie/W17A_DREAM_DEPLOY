import { DEFAULT_VALID_THUMBNAIL_URL } from './library/constants';
import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestClear,
  requestCreateQuestionV2,
  requestPlayerCreate,
  requestSessionStart,
  requestUpdateSessionState,
} from './library/route_testing_functions';
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
