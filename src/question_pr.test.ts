import request from 'sync-request-curl';
import config from './config.json';
import { requestDelete, requestAdminRegister } from './auth_2.test';
import { requestAdminQuizCreate } from './quiz_2.test';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  WAIT_TIME,
  RESPONSE_ERROR_403,
} from './library/constants';

import { QuestionBody, CreateQuizQuestionReturn } from './library/interfaces';

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// interfaces used throughout file - START

// interface RequestResult {
//   body: any;
//   status: number;
// }

// export interface QuestionId {
//   questionId: number;
// }

// export interface ErrorObjectWithCode {
//   error: string;
//   errorCode: number;
// }

// export interface CreateQuizQuestionReturn {
//   createQuizQuestionResponse: QuestionId | ErrorObjectWithCode;
// }

export interface CreateQuizQuestionServerReturn {
  bodyString: CreateQuizQuestionReturn;
  statusCode: number;
}

// interfaces used throughout file - END

// Functions to execute before each test is run - START
// beforeEach(() => {
//   requestDelete();
// });

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

describe.only('Testing POST /v1/admin/quiz/{quizId}/question', () => {
  let token: string;
  let quizId: number;

  test.only('Testing successful creating a quiz question', () => {
    // Passed 21Oct23 12:52
    // Result
    // newQuestion -> { body: { questionId: 1 }, status: 200 }
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
    console.log('First question ----------------------');
    console.log('token ->', token);
    console.log('validQuestion ->', validQuestion);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);

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

  test.only('Testing QuizId does not refer to valid quiz - error code 400', () => {
    // Passed 21Oct23 12:56
    // Response
    // Response: newQuestion -> { body: { error: 'Error' }, status: 400 }

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
    console.log('Second question ----------------------');
    console.log('token ->', token);
    console.log('validQuestion ->', validQuestion);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);

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

  test.only('Question string is less than 5 characters - error code 400', () => {
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
    console.log('Third question ----------------------');
    console.log('token ->', token);
    console.log('shortQuizIdQuestion ->', shortQuizIdQuestion);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);

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

  test.only('Question string is more than 50 characters - error code 400', () => {
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
    console.log('Fourth question ----------------------');
    console.log('token ->', token);
    console.log('longQuizIdQuestion ->', longQuizIdQuestion);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Question duration is not a positive number - error code 400', () => {
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
    console.log('Fifth question ----------------------');
    console.log('token ->', token);
    console.log('negativeLength ->', negativeLength);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Question has less than 2 answers - error code 400', () => {
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
    console.log('Sixth question ----------------------');
    console.log('token ->', token);
    console.log('oneAnswer ->', oneAnswer);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Question has more than 6 answers - error code 400', () => {
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
    console.log('Seventh question ----------------------');
    console.log('token ->', token);
    console.log('tooManyAnswers ->', tooManyAnswers);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Question duration exceeds 3 minutes - error code 400', () => {
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
    console.log('Eigth question ----------------------');
    console.log('token ->', token);
    console.log('question ->', question);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Points awarded for question is not between 1 and 10 - error code 400', () => {
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
    console.log('Ninth question ----------------------');
    console.log('token ->', token);
    console.log('lessThanOne ->', lessThanOne);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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
    console.log('Tenth question ----------------------');
    console.log('token ->', token);
    console.log('moreThanTen ->', moreThanTen);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion2 ->', newQuestion2);
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

  test.only('The length of the answers must be between 1 and 30 characters - error code 400', () => {
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
    console.log('Eleventh question ----------------------');
    console.log('token ->', token);
    console.log('lessThanOne ->', lessThanOne);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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
    console.log('Twelveth question ----------------------');
    console.log('token ->', token);
    console.log('moreThanThirty ->', moreThanThirty);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion2 ->', newQuestion2);
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

  test.only('Answer strings are duplicates of one another - error code 400', () => {
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
    console.log('Fourteenth question ----------------------');
    console.log('token ->', token);
    console.log('duplicateAnswers ->', duplicateAnswers);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('There are no correct answers - error code 400', () => {
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
    console.log('Fifteenth question ----------------------');
    console.log('token ->', token);
    console.log('incorrectAnswers ->', incorrectAnswers);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Testing Token is empty or invalid - error code 401', () => {
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
    console.log('Sixteenth question ----------------------');
    console.log('token ->', token);
    console.log('validQuestion ->', validQuestion);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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

  test.only('Valid token is provided, but user is not an owner of this quiz - error code 403', () => {
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
    console.log('Sixteenth question ----------------------');
    console.log('token ->', token2);
    console.log('validQuestion ->', validQuestion);
    console.log('quizId ->', quizId);
    console.log('Response: newQuestion ->', newQuestion);
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
