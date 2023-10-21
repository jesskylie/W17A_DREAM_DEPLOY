import request from 'sync-request-curl';
import config from './config.json';
import { requestDelete, requestAdminRegister } from './auth_2.test';
import { requestAdminQuizCreate } from './quiz_2.test';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

import { QuestionBody, CreateQuizQuestionReturn } from './library/interfaces';

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// interfaces used throughout file - START

export interface CreateQuizQuestionServerReturn {
  bodyString: CreateQuizQuestionReturn;
  statusCode: number;
}

// interfaces used throughout file - END

function requestCreateQuestion(
  token: string,
  question: QuestionBody,
  quizId: number
): CreateQuizQuestionServerReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    {
      json: {
        token: token,
        questionBody: {
          question: question.question,
          duration: question.duration,
          points: question.points,
          answers: question.answers as QuestionBody['answers'],
        },
      },
    }
  );

  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return {
    bodyString,
    statusCode,
  };
}

describe('Testing POST /v1/admin/quiz/{quizId}/question', () => {
  let token: string;
  let quizId: number;

  test('Testing successful creating a quiz question', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
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
    } as QuestionBody;

    const newQuestion = requestCreateQuestion(
      token,
      validQuestion,
      quizId
    ) as CreateQuizQuestionServerReturn;

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testQuizId = newQuestionResponse.createQuizQuestionResponse;
        if ('questionId' in testQuizId) {
          const testQuestionId = { questionId: testQuizId.questionId };
          expect(testQuestionId).toStrictEqual({
            questionId: expect.any(Number),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_OK_200);
    }
  });

  test('Testing QuizId does not refer to valid quiz - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // create invalid quizIdcheck quizId was returned

    const quizId = -1;

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
    } as QuestionBody;

    const newQuestion = requestCreateQuestion(token, validQuestion, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question string is less than 5 characters - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const shortQuizIdQuestion = {
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
    } as QuestionBody;
    const newQuestion = requestCreateQuestion(
      token,
      shortQuizIdQuestion,
      quizId
    );

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question string is more than 50 characters - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const longQuizIdQuestion = {
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
    } as QuestionBody;
    const newQuestion = requestCreateQuestion(
      token,
      longQuizIdQuestion,
      quizId
    );

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question duration is not a positive number - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const negativeLength = {
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
    } as QuestionBody;
    const newQuestion = requestCreateQuestion(token, negativeLength, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question has less than 2 answers - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const oneAnswer = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
      ],
    } as QuestionBody;
    const newQuestion = requestCreateQuestion(token, oneAnswer, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question has more than 6 answers - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const tooManyAnswers = {
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
          correct: false,
        },
      ],
    } as QuestionBody;
    const newQuestion = requestCreateQuestion(token, tooManyAnswers, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question duration exceeds 3 minutes - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const question = {
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
    } as QuestionBody;
    const newQuestion = requestCreateQuestion(token, question, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Points awarded for question is not between 1 and 10 - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const lessThanOne = {
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
    } as QuestionBody;

    const moreThanTen = {
      question: 'What color is the sky?',
      duration: 2,
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
    } as QuestionBody;

    const newQuestion = requestCreateQuestion(token, lessThanOne, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }

    const newQuestion2 = requestCreateQuestion(token, moreThanTen, quizId);

    if ('bodyString' in newQuestion2) {
      const newQuestionResponse = newQuestion2.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion2) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('The length of the answers must be between 1 and 30 characters - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const lessThanOne = {
      question: 'What color is the sky?',
      duration: 3,
      points: 5,
      answers: [
        {
          answer: '',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;

    const moreThanThirty = {
      question: 'What color is the sky?',
      duration: 3,
      points: 5,
      answers: [
        {
          answer:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;

    const newQuestion = requestCreateQuestion(token, lessThanOne, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }

    const newQuestion2 = requestCreateQuestion(token, moreThanThirty, quizId);

    if ('bodyString' in newQuestion2) {
      const newQuestionResponse = newQuestion2.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion2) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Answer strings are duplicates of one another - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const duplicateAnswers = {
      question: 'What color is the sky?',
      duration: 2,
      points: 5,
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
    } as QuestionBody;

    const newQuestion = requestCreateQuestion(token, duplicateAnswers, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('There are no correct answers - error code 400', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    const incorrectAnswers = {
      question: 'What is 2 + 2?',
      duration: 3,
      points: 4,
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
    } as QuestionBody;

    const newQuestion = requestCreateQuestion(token, incorrectAnswers, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Testing Token is empty or invalid - error code 401', () => {
    requestDelete();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    let token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    // Incorrect - has to return 401
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 5,
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
    } as QuestionBody;

    token = 1;
    const newQuestion = requestCreateQuestion(token, validQuestion, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_401);
    }
  });

  test('Valid token is provided, but user is not an owner of this quiz - error code 403', () => {
    requestDelete();
    // user1 created and user1's token creates quiz
    const user1 = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    let token = user1.body.token;
    const quizCreateResponse = requestAdminQuizCreate(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // user2 created. user2 does not create a quiz
    const user2 = requestAdminRegister(
      'paul@gmail.com',
      'abcde4284',
      'Paul',
      'Rather'
    );
    let token2 = user2.body.token;
    // check quizId was returned
    if ('quizId' in quizCreateResponse.bodyString) {
      quizId = quizCreateResponse.bodyString.quizId;
    }
    // Incorrect - has to return 401
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      points: 5,
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
    } as QuestionBody;

    // question is created on quizId of user1, but with user2's token
    const newQuestion = requestCreateQuestion(token2, validQuestion, quizId);

    if ('bodyString' in newQuestion) {
      const newQuestionResponse = newQuestion.bodyString;
      if ('createQuizQuestionResponse' in newQuestionResponse) {
        const testErrorExists = newQuestionResponse.createQuizQuestionResponse;
        if ('error' in testErrorExists) {
          const testErrorObject = { error: testErrorExists.error };
          expect(testErrorObject).toStrictEqual({
            error: expect.any(String),
          });
        }
      }
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_403);
    }
  });
});
