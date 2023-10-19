import request from 'sync-request-curl';
import config from './config.json';
import { requestDelete, requestAdminRegister } from './auth_2.test';
import { requestAdminQuizCreate } from './quiz_2.test'


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

interface Question {
  token: string;
  questionBody: {
    question: string;
    duration: number;
    points: number;
    answers:
			{
      	answer: string;
      	correct: boolean;
			}[];
  };
}

interface RequestResult {
	body: string;
	status: number;
}
  
  // interfaces used throughout file - END

// Functions to execute before each test is run - START
beforeEach(() => {
    requestDelete();
  });

function requestCreateQuestion(question: Question): RequestResult
{
  const res = request('POST', SERVER_URL + '/v1/admin/quiz/:quizid/question', {
    json: {
      token: question.token,
      questionBody: {
        question: question.questionBody.question,
        duration: question.questionBody.duration,
        points: question.questionBody.points,
        answers: question.questionBody.answers,
      },
    },
  });
	
	return {
		body: JSON.parse(res.body.toString()),
		status: res.statusCode,
	}
}

describe('Testing POST /v1/admin/quiz/:quizId/question', () => {
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
		}
	  });
	
	test('Testing successful creating a quiz question', () => {

		const validQuestion = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(validQuestion);
		expect(newQuestion.body).toStrictEqual({ questionId: expect.any(Number) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_OK_200);
	});
	
	test('Testing QuizId does not refer to valid quiz - error code 400', () => {
		const validQuestion = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(validQuestion);
		if (!quizId) {
			expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
			expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		}
	});
	
	test('Question string is less than 5 characters - error code 400', () => {
		const shortQuizIdQuestion = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(shortQuizIdQuestion);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question string is more than 50 characters - error code 400', () => {
		const longQuizIdQuestion = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(longQuizIdQuestion);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question duration is not a positive number - error code 400', () => {
		const negativeLength = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(negativeLength);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question has less than 2 answers - error code 400', () => {
		const oneAnswer = {
			token: token,
			questionBody: {
				question: 'What color is the sky?',
				duration: 2,
				points: 10,
				answers: [
					{
						answer: 'Blue',
						correct: true,
					},
				],
			}
		};
		const newQuestion = requestCreateQuestion(oneAnswer);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Question has more than 6 answers - error code 400', () => {
		const tooManyAnswers = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(tooManyAnswers);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	
	test('Question duration exceeds 3 minutes - error code 400', () => {
		const question = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(question);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Points awarded for question is not between 1 and 10 - error code 400', () => {
		const lessThanOne = {
			token: token,
			questionBody: {
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
			}
		};
		
		const moreThanTen = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(lessThanOne);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		
		const newQuestion2 = requestCreateQuestion(moreThanTen);
		expect(newQuestion2.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion2.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('The length of the answers must be between 1 and 30 characters - error code 400', () => {
		const lessThanOne = {
			token: token,
			questionBody: {
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
			}
		};
		
		const moreThanThirty = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(lessThanOne);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		
		const newQuestion2 = requestCreateQuestion(moreThanThirty);
		expect(newQuestion2.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion2.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('Answer strings are duplicates of one another - error code 400', () => {
		const duplicateAnswers = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(duplicateAnswers);
		expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
		expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
	});
	
	test('There are no correct answers - error code 400', () => {
		const incorrectAnswers = {
			token: token,
			questionBody: {
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
			}
		};
	
		const newQuestion = requestCreateQuestion(incorrectAnswers);
		expect (newQuestion.status).toStrictEqual(RESPONSE_ERROR_400);
		expect (newQuestion.body).toStrictEqual({ error: expect.any(String) });
	});
	
	test('Testing Token is empty or invalid - error code 401', () => {
		const validQuestion = {
			token: token,
			questionBody: {
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
			}
		};
		const newQuestion = requestCreateQuestion(validQuestion);
		if (!token) {
			expect(newQuestion.body).toStrictEqual({ error: expect.any(String) });
			expect(newQuestion.status).toStrictEqual(RESPONSE_ERROR_401);
		}
	});
});








