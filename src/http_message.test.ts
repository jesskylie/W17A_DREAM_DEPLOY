import { DEFAULT_VALID_THUMBNAIL_URL } from './library/constants';
import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminRegister,
  requestClear,
  requestCreateQuestionV2,
  requestPlayerCreate,
  requestSessionStart,
  requestSendMessage,
  requestGetChatMessages
} from './library/route_testing_functions';
import { SessionId } from './quiz';

describe('Testing POST /v1/player/{playerid}/chat', () => {
  test('Success sending message', () => {
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
    const sessionId = requestSessionStart(quizId.quizId, result.body.token, 5) as SessionId;
    const playerOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerTwo = requestPlayerCreate(sessionId.sessionId, 'Kim Kardashian');
    const messageOne = 'Hello everyone! Nice to chat.';
    const messageTwo = 'Hello nice to meet you';
    expect(requestSendMessage(playerOne.playerId, messageOne)).toStrictEqual({});
    expect(requestSendMessage(playerTwo.playerId, messageTwo)).toStrictEqual({});
  });

  test('Player Id does not exist - 400 error', () => {
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
    const sessionId = requestSessionStart(quizId.quizId, result.body.token, 5) as SessionId;
    requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    expect(() => requestSendMessage(-1, 'Hello everyone')).toThrow(HTTPError[400]);
  });

  test('Message body less than 1 character', () => {
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
    const sessionId = requestSessionStart(quizId.quizId, result.body.token, 5) as SessionId;
    const playerOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    expect(() => requestSendMessage(playerOne.playerId, '')).toThrow(HTTPError[400]);
  });

  test('Message body more than 100 characters', () => {
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
    const sessionId = requestSessionStart(quizId.quizId, result.body.token, 5) as SessionId;
    const playerOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const longMsg = 'Quick brown fox jumps over the lazy dog. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100.';
    expect(() => requestSendMessage(playerOne.playerId, longMsg)).toThrow(HTTPError[400]);
  });
});

describe('Testing GET /v1/player/:playerid/chat', () => {
  test('Success getting message history', () => {
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
    const sessionId = requestSessionStart(quizId.quizId, result.body.token, 5) as SessionId;
    const playerOne = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    const playerTwo = requestPlayerCreate(sessionId.sessionId, 'Kim Kardashian');
    const messageOne = 'Hello everyone! Nice to chat.';
    const messageTwo = 'Hello nice to meet you';
    requestSendMessage(playerOne.playerId, messageOne);
    requestSendMessage(playerTwo.playerId, messageTwo);
    const messageResult = {
      messages: [
        {
          messageBody: 'Hello everyone! Nice to chat.',
          playerId: playerOne.playerId,
          playerName: 'Haley Berry',
          timeSent: expect.any(Number),
        },
        {
          messageBody: 'Hello nice to meet you',
          playerId: playerTwo.playerId,
          playerName: 'Kim Kardashian',
          timeSent: expect.any(Number),
        }
      ]
    };
    expect(requestGetChatMessages(playerOne.playerId)).toStrictEqual(messageResult);
  });

  test('Player Id does not exist - 400 error', () => {
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
    const sessionId = requestSessionStart(quizId.quizId, result.body.token, 5) as SessionId;
    requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
    expect(() => requestGetChatMessages(-1)).toThrow(HTTPError[400]);
  });
});
