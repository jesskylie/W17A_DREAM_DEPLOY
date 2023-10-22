import request from 'sync-request-curl';
import config from './config.json';
import { requestDelete, requestAdminRegister } from './auth_2.test';
import { requestAdminQuizCreate } from './quiz_2.test'
import { Question } from './dataStore';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  WAIT_TIME,
	RESPONSE_ERROR_403,
} from './library/constants';

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// interfaces used throughout file - START
interface RequestResult {
	body: any;
	status: number;
}
  
  // interfaces used throughout file - END

// Functions to execute before each test is run - START
// beforeEach(() => {
//     // requestDelete();
//   });

function requestCreateQuestion(token: string, question: Question, quizId: number): RequestResult
{
  const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/question`, {
    json: {
      token: token,
      questionBody: {
        question: question.question,
        duration: question.duration,
        points: question.points,
        answers: question.answers,
      },
    },
  });
	
	return {
		body: JSON.parse(res.body.toString()),
		status: res.statusCode,
	}
}

describe.only('Testing POST /v1/admin/quiz/{quizId}/question', () => {
	let token: string;
	let quizId: number;

	beforeAll(() => {
		// Register admin and create quiz for testing 
		const response = requestAdminRegister('abc@hotmail.com','abcde4284','Ann','Pie');
		token = response.body.token;
		const quizCreateResponse = requestAdminQuizCreate(token, "New Quiz", "Description of quiz");
		// check quizId was returned 
		if ('quizId' in quizCreateResponse.bodyString) {
			quizId = quizCreateResponse.bodyString.quizId;
			console.log('Quiz id is:', quizId);
		}
	});
	
	test('Testing successful creating a quiz question', () => {
	  const validQuestion = {
			question: 'What color is the sky?',
			duration: 2,
			points: 10,
			answers: [
				{
					answer: 'Blue',
					correct: true,
				},
				{
					answer: 'Green',
					correct: false,
				},
			],
		};
		
		const newQuestion = requestCreateQuestion(token, validQuestion, quizId);
		
		// expect(newQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
		// expect(newQuestion.status).toStrictEqual(RESPONSE_OK_200);
	});
	
	test('Testing QuizId does not refer to valid quiz - error code 400', () => {
		const validQuestion = {
			token: token,
			question: 'What color is the sky?',
			duration: 2,
			points: 10,
			answers: [
				{
					answer: 'Blue',
					correct: true,
				},
				{
					answer: 'Green',
					correct: false,
					},
				],
		};
		const newQuestion = requestCreateQuestion(token, validQuestion, quizId);
		if (!quizId) {
			expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400  });
			expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		}
	});
	
	test('Question string is less than 5 characters - error code 400', () => {
		const shortQuizIdQuestion = {
			token: token,
			question: '?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, shortQuizIdQuestion, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question string is more than 50 characters - error code 400', () => {
		const longQuizIdQuestion = {
			token: token,
			
				question: '1234567891 1234567891 1234567891 1234567891 1234567891?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, longQuizIdQuestion, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400  });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question duration is not a positive number - error code 400', () => {
		const negativeLength = {
			token: token,
			
				question: 'What color is the sky?',
				duration: -1,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, negativeLength, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question has less than 2 answers - error code 400', () => {
		const oneAnswer = {
			token: token,
			
				question: 'What color is the sky?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, oneAnswer, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question has more than 6 answers - error code 400', () => {
		const tooManyAnswers = {
			token: token,
			
				question: 'What color is the sky?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Yellow',
						correct: false,
					},
					{
						answer: 'Blue',
						correct: false,
					},
					{
						answer: 'Blue',
						correct: false,
					},
					{
						answer: 'Red',
						correct: false,
					},
					{
						answer: 'Green',
						correct: false,
					},
					{
						answer: 'Black',
						correct:false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, tooManyAnswers, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400  });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	
	test('Question duration exceeds 3 minutes - error code 400', () => {
		const question = {
			token: token,
			
				question: 'What color is the sky?',
				duration: 10,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, question, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Points awarded for question is not between 1 and 10 - error code 400', () => {
		const lessThanOne = {
			token: token,
		
				question: 'What color is the sky?',
				duration: 2,
				points: 0,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		
		const moreThanTen = {
			token: token,
		
				question: 'What color is the sky?',
				duration: 10,
				points: 20,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, lessThanOne, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		
		const newQuestion2 = requestCreateQuestion(token, moreThanTen, quizId);
		expect(newQuestion2.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion2.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('The length of the answers must be between 1 and 30 characters - error code 400', () => {
		const lessThanOne = {
			token: token,
		
				question: 'What color is the sky?',
				duration: 10,
				points: 10,
				answers: [
					{
						answer: 'B',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		
		const moreThanThirty = {
			token: token,
		
				question: 'What color is the sky?',
				duration: 10,
				points: 10,
				answers: [
					{
						answer: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, lessThanOne, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		
		const newQuestion2 = requestCreateQuestion(token, moreThanThirty, quizId);
		expect(newQuestion2.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion2.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Answer strings are duplicates of one another - error code 400', () => {
		const duplicateAnswers = {
			token: token,
			
				question: 'What color is the sky?',
				duration: 10,
				points: 10,
				answers: [
					{
						answer: 'Yellow',
						correct: true,
					},
					{
						answer: 'Yellow',
						correct: true,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, duplicateAnswers, quizId);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('There are no correct answers - error code 400', () => {
		const incorrectAnswers = {
			token: token,
			
				question: 'What is 2 + 2?',
				duration: 5,
				points: 10,
				answers: [
					{
						answer: 'Yellow',
						correct: false,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
	
		const newQuestion = requestCreateQuestion(token, incorrectAnswers, quizId);
		expect (newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		expect (newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 400 });
	});
	
	test('Testing Token is empty or invalid - error code 401', () => {
		const validQuestion = {
			token: token,
			
				question: 'What color is the sky?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
					{
						answer: 'Green',
						correct: false,
					},
				],
			
		};
		const newQuestion = requestCreateQuestion(token, validQuestion, quizId);
		if (!token) {
			expect(newQuestion.body).toStrictEqual({ error: expect.any(String), errorCode: 401});
			expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_401);
		}
	});
});








