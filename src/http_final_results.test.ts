import { DEFAULT_VALID_THUMBNAIL_URL } from './library/constants';
import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestClear,
  requestCreateQuestionV2,
  requestPlayerCreate,
  requestSessionStart,
  requestAnswerQuestion,
  requestUpdateSessionState,
  requestResultsOfAnswers,
  requestGetQuizFinalResults,
} from './library/route_testing_functions';
import { SessionId } from './quiz';
import { Action } from './dataStore';

describe('/v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  test('Success - 2/2 players answer correctly', () => {
    requestClear();
    const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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

    // const questionTwo = {
    //   question: 'What is the colour of the sky?',
    //   duration: 4,
    //   points: 5,
    //   answers: [
    //     {
    //       answerId: 0,
    //       answer: 'Yellow',
    //       colour: 'red',
    //       correct: true,
    //     },
    //     {
    //       answerId: 1,
    //       answer: 'Red',
    //       colour: 'yellow',
    //       correct: false,
    //     },
    //   ],
    //   thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    // };
    requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
    // requestCreateQuestionV2(result.body.token, questionTwo, quizId.quizId);
    const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS);
    expect(requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, result.body.token)).toStrictEqual(
      {
        usersRankedByScore: [
          {
            name: 'Haley Berry',
            score: 5,
          },
          {
            name: 'Vin Diesel',
            score: 5,
          }
        ],
        questionResults: [
          {
            questionId: 1,
            playersCorrectList: [
              'Haley Berry', 'Vin Diesel',
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 100,
          }
        ]
      }
    );
  });

  test('Success 2/4 players answers correctly', () => {
    requestClear();
    const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
      5) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');
    const playerIdThree = requestPlayerCreate(sessionId.sessionId, 'Kim Kardashian');
    const playerIdFour = requestPlayerCreate(sessionId.sessionId, 'Bob Smith');

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);

    // 2 out of 4 players answer correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestAnswerQuestion(playerIdThree.playerId, [1], 0);
    requestAnswerQuestion(playerIdFour.playerId, [1], 0);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS);
    expect(requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, result.body.token)).toStrictEqual(
      {
        usersRankedByScore: [
          {
            name: 'Haley Berry',
            score: 5,
          },
          {
            name: 'Vin Diesel',
            score: 5,
          }
        ],
        questionResults: [
          {
            questionId: 1,
            playersCorrectList: [
              'Haley Berry', 'Vin Diesel',
            ],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50,
          }
        ]
      });
  });

  test('Session Id does not refer to valid session within this quiz - 400 error', () => {
    requestClear();
    const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
      5) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS);
    expect(() => requestGetQuizFinalResults(quizId.quizId, -1, result.body.token)).toThrow(HTTPError[400]);
  });

  test('Session is not in FINAL_RESULTS state - 400 er', () => {
    requestClear();
    const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
      5) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerIdOne.playerId, 0);
    expect(() => requestGetQuizFinalResults(quizId.quizId, -1, result.body.token)).toThrow(HTTPError[400]);
  });

  test('Token is empty/invalid - 401 error', () => {
    requestClear();
    const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
      5) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS);
    expect(() => requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, 'abcde')).toThrow(HTTPError[401]);
    expect(() => requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, '')).toThrow(HTTPError[401]);
  });

  test('Token is empty/invalid - 403 error', () => {
    requestClear();
    const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
    const resultTwo = requestAdminRegister('jacob@hotmail.com', '12345abced', 'Jacob', 'Berry');
    const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
      5) as SessionId;
    const playerIdOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerIdTwo = requestPlayerCreate(sessionId.sessionId, 'Vin Diesel');

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.NEXT_QUESTION);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.SKIP_COUNTDOWN);

    // both answers chosen correctly
    requestAnswerQuestion(playerIdOne.playerId, [0], 0);
    requestAnswerQuestion(playerIdTwo.playerId, [0], 0);
    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_ANSWER);
    requestResultsOfAnswers(playerIdOne.playerId, 0);

    requestUpdateSessionState(quizId.quizId, sessionId.sessionId, result.body.token, Action.GO_TO_FINAL_RESULTS);
    expect(() => requestGetQuizFinalResults(quizId.quizId, sessionId.sessionId, resultTwo.body.token)).toThrow(HTTPError[403]);
  });
});
