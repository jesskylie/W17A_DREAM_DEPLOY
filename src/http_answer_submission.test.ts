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
} from './library/route_testing_functions';
import { SessionId } from './quiz';
import { Action } from './dataStore';

describe('Test: POST /v1/player/join', () => {
	test('Success - valid answer submission', () => {
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
		
		const questionTwo = {
      question: 'What is the colour of the Sky?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Yellow',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Black',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
		requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
		requestCreateQuestionV2(result.body.token, questionTwo, quizId.quizId);
		const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
		const playerId = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		expect(requestAnswerQuestion(playerId.playerId, 0, 1).toStrictEqual({}));
	});
	
	test('PlayerId does not exist - 400 error', () => {
		requestClear();
		const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
		const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
		const sessionId = requestSessionStart(quizId.quizId,result.body.token, 5) as SessionId;
		requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		expect(() => requestAnswerQuestion(-90, 0, 1)).toThrow(HTTPError[400]);
	});
	
	test('Question position is not valid for session this player is in - 400 error', () => {
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
		
		const questionTwo = {
      question: 'What is the colour of the Sky?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Yellow',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Black',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
		requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
		requestCreateQuestionV2(result.body.token, questionTwo, quizId.quizId);
		const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
		const playerId = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		expect(requestAnswerQuestion(playerId.playerId, 0, 10).toStrictEqual({}));
	});
	
	test('Session is not in QUESTION_OPEN state - 400 error', () => {
		const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
		const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
		const sessionId = requestSessionStart(quizId.quizId,result.body.token, 5) as SessionId;
		const playerId = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		//quiz is still in LOBBY state and no in QUESTION_OPEN STATE
		expect(() => requestAnswerQuestion(playerId.playerId, 0, 1)).toThrow(HTTPError[400]);
		requestClear();
	});
	
	test('Session is not yet up to this particular question - 400 error', () => {
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
		
		const questionTwo = {
      question: 'What is the colour of the Sky?',
      duration: 4,
      points: 5,
      answers: [
        {
          answerId: 0,
          answer: 'Yellow',
          colour: 'red',
          correct: true,
        },
        {
          answerId: 1,
          answer: 'Black',
          colour: 'yellow',
          correct: false,
        },
      ],
      thumbnailUrl: DEFAULT_VALID_THUMBNAIL_URL,
    };
		requestCreateQuestionV2(result.body.token, questionOne, quizId.quizId);
		requestCreateQuestionV2(result.body.token, questionTwo, quizId.quizId);
		const sessionId = requestSessionStart(
      quizId.quizId,
      result.body.token,
      5) as SessionId;
		const playerId = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		expect(requestAnswerQuestion(playerId.playerId, 0, 2).toStrictEqual({}));
	});
	
	test('Answer IDS are not valid for this particular question - 400 error', () => {
		requestClear();
		const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
		const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
		const sessionId = requestSessionStart(quizId.quizId,result.body.token, 5) as SessionId;
		const playerId = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		expect(() => requestAnswerQuestion(playerId.playerId, 99, 1)).toThrow(HTTPError[400]);
	});
	
	test('Less than 1 answer Id was submitted - 400 error', () => {
		requestClear();
		const result = requestAdminRegister('hayley@hotmail.com', '12345abced', 'Haley', 'Berry');
		const quizId = requestAdminQuizCreateV2(result.body.token, 'New Quiz', 'Quiz description');
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
		const sessionId = requestSessionStart(quizId.quizId,result.body.token, 5) as SessionId;
		const playerId = requestPlayerCreate(sessionId.sessionId, 'Haley Berry');
		expect(() => requestAnswerQuestion(playerId.playerId, '', 1)).toThrow(HTTPError[400]);
	});
	
});
