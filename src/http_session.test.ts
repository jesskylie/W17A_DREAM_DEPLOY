import HTTPError from 'http-errors';
import {
  requestSessionStart,
  requestClear,
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestCreateQuestionV2,
  requestViewAllSessions,
  requestUpdateSessionState,
} from './library/route_testing_functions';
import { DEFAULT_VALID_THUMBNAIL_URL, RESPONSE_ERROR_400 } from './library/constants';

import { QuizId, SessionId } from './quiz';
import { Action } from './dataStore';

describe('Testing POST /v2/admin/quiz', () => {
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
    expect(
      requestSessionStart(quizId.quizId, result.body.token, 5)
    ).toStrictEqual({ sessionId: expect.any(Number) });
  });

  test('autoStartNum is greater than 50 - error 400', () => {
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
    expect(() =>
      requestSessionStart(quizId.quizId, result.body.token, 90)
    ).toThrow(HTTPError[400]);
  });

  test('The quiz does not have any questions in it - error 400', () => {
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
    expect(() =>
      requestSessionStart(quizId.quizId, result.body.token, 5)
    ).toThrow(HTTPError[400]);
  });

  test('A maximum of 10 sessions that are not in END state currently exist - error 400', () => {
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
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    requestSessionStart(quizId.quizId, result.body.token, 5);
    expect(() =>
      requestSessionStart(quizId.quizId, result.body.token, 5)
    ).toThrow(HTTPError[400]);
  });

  test('Token is empty or invalid - error 401', () => {
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
    expect(() => requestSessionStart(quizId.quizId, '', 5)).toThrow(
      HTTPError[401]
    );
    expect(() => requestSessionStart(quizId.quizId, 'abcde', 5)).toThrow(
      HTTPError[401]
    );
  });

  test('Valid token is provided, but user is not an owner of this quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const userTwo = requestAdminRegister(
      'bob@hotmail.com',
      '12345abced',
      'Bob',
      'Smith'
    );
    const userOneQuizId = requestAdminQuizCreateV2(
      userOne.body.token,
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
    requestCreateQuestionV2(userOne.body.token, question, userOneQuizId.quizId);
    expect(() =>
      requestSessionStart(userOneQuizId.quizId, userTwo.body.token, 5)
    ).toThrow(HTTPError[403]);
  });
});

describe('Test: GET /v1/admin/quiz/{quizid}/sessions', () => {
  test('successful case', () => {
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
    ) as QuizId;
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
    const session1 = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const session2 = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    // requestUpdateSessionState(quizId.quizId, session2.sessionId, result.body.token, Action.END);
    expect(
      requestViewAllSessions(result.body.token, quizId.quizId)
    ).toStrictEqual({
      activeSessions: [session1.sessionId, session2.sessionId],
      inactiveSessions: [],
    });
  });

  test('Token is empty or invalid (does not refer to valid logged in user session) - error 401', () => {
    requestClear();
    expect(() => requestViewAllSessions('', 0)).toThrow(HTTPError(401));
    expect(() => requestViewAllSessions('token', 0)).toThrow(HTTPError(401));
  });

  test('Valid token is provided, but user is not an owner of this quiz - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const userTwo = requestAdminRegister(
      'bob@hotmail.com',
      '12345abced',
      'Bob',
      'Smith'
    );
    const userOneQuizId = requestAdminQuizCreateV2(
      userOne.body.token,
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
    requestCreateQuestionV2(userOne.body.token, question, userOneQuizId.quizId);
    requestSessionStart(userOneQuizId.quizId, userOne.body.token, 5);
    expect(() =>
      requestViewAllSessions(userTwo.body.token, userOneQuizId.quizId)
    ).toThrow(HTTPError[403]);
  });
});

describe('Test: PUT /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
  test('successful case', () => {
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
    ) as QuizId;
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
    const session1 = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    const session2 = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    requestUpdateSessionState(quizId.quizId, session2.sessionId, result.body.token, Action.END);
    expect(
      requestViewAllSessions(result.body.token, quizId.quizId)
    ).toStrictEqual({
      activeSessions: [session1.sessionId],
      inactiveSessions: [session2.sessionId],
    });
  });

  test('SessionId is invalid (does not refer to valid session within this quiz) - error 400', () => {
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
    ) as QuizId;
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
    const session1 = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    expect(() => requestUpdateSessionState(quizId.quizId, -1 * session1.sessionId, result.body.token, Action.END)).toThrow(HTTPError(RESPONSE_ERROR_400));
  });

  test('Action enum cannot be applied in the current state - error 400', () => {
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
    ) as QuizId;
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
    const session1 = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5
    ) as SessionId;
    requestUpdateSessionState(quizId.quizId, session1.sessionId, result.body.token, Action.END);
    expect(() => requestUpdateSessionState(quizId.quizId, session1.sessionId, result.body.token, Action.END)).toThrow(HTTPError(RESPONSE_ERROR_400));
  });

  test('Token is empty or invalid (does not refer to valid logged in user session) - error 401', () => {
    requestClear();
    expect(() => requestUpdateSessionState(1, 1, '', Action.END)).toThrow(HTTPError(401));
    expect(() => requestUpdateSessionState(1, 1, 'invalid', Action.END)).toThrow(HTTPError(401));
  });

  test('Valid token is provided, but user is not authorised to modify this session - error 403', () => {
    requestClear();
    const userOne = requestAdminRegister(
      'hayley@hotmail.com',
      '12345abced',
      'Haley',
      'Berry'
    );
    const userTwo = requestAdminRegister(
      'bob@hotmail.com',
      '12345abced',
      'Bob',
      'Smith'
    );
    const userOneQuizId = requestAdminQuizCreateV2(
      userOne.body.token,
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
    requestCreateQuestionV2(userOne.body.token, question, userOneQuizId.quizId);
    const session1 = requestSessionStart(
      userOneQuizId.quizId,
      userOne.body.token,
      5
    ) as SessionId;
    expect(() =>
      requestUpdateSessionState(userOneQuizId.quizId, session1.sessionId, userTwo.body.token, Action.END)
    ).toThrow(HTTPError[403]);
  });
});
