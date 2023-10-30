import request from 'sync-request-curl';
import config from './config.json';

import {
  requestClear,
  requestAdminRegister,
} from './library/route_testing_functions';

import {
  requestAdminQuizCreate,
  requestAdminQuizInfo,
} from './library/route_testing_functions';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  WAIT_TIME,
} from './library/constants';

import {
  QuestionBody,
  CreateQuizQuestionReturn,
  requestAdminQuizInfoReturn,
} from './library/interfaces';

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
      timeout: WAIT_TIME,
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
    requestClear();
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
      // if ('createQuizQuestionResponse' in newQuestionResponse) {
      //   const testQuizId = newQuestionResponse.createQuizQuestionResponse;
      if ('questionId' in newQuestionResponse) {
        const testQuestionId = { questionId: newQuestionResponse.questionId };
        expect(testQuestionId).toStrictEqual({
          questionId: expect.any(Number),
        });
      }
    } else {
      expect(false).toStrictEqual(true);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_OK_200);
    }
  });

  test('Testing QuizId does not refer to valid quiz - error code 403', () => {
    requestClear();
    const response = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    token = response.body.token;
    requestAdminQuizCreate(token, 'New Quiz', 'Description of quiz');
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(false).toStrictEqual(true);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_403);
    }
  });

  test('Question string is less than 5 characters - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question string is more than 50 characters - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question duration is not a positive number - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question has less than 2 answers - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question has more than 6 answers - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question duration exceeds 3 minutes - error code 400', () => {
    requestClear();
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
    const question1 = {
      question: 'What color is the sky?',
      duration: 90,
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

    requestCreateQuestion(token, question1, quizId);

    const question2 = {
      question: 'Who makes the 787 Dreamliner?',
      duration: 100,
      points: 10,
      answers: [
        {
          answer: 'Boeing',
          correct: true,
        },
        {
          answer: 'Airbus',
          correct: false,
        },
      ],
    } as QuestionBody;

    const newQuestion2 = requestCreateQuestion(token, question2, quizId);

    if ('bodyString' in newQuestion2) {
      const newQuestionResponse = newQuestion2.bodyString;

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion2) {
      const testStatusCode = newQuestion2.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Question duration updated correctly - response true', () => {
    requestClear();
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

    const duration1 = 3;
    const duration2 = 11;
    const question1 = {
      question: 'What color is the sky?',
      duration: duration1,
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

    requestCreateQuestion(token, question1, quizId);

    const question2 = {
      question: 'Who makes the 787 Dreamliner?',
      duration: duration2,
      points: 10,
      answers: [
        {
          answer: 'Boeing',
          correct: true,
        },
        {
          answer: 'Airbus',
          correct: false,
        },
      ],
    } as QuestionBody;

    requestCreateQuestion(token, question2, quizId);

    // get infomration about quiz
    // /v1/admin/quiz/{quizid}

    // Test that the duration of the two questions equals
    // the total duration of the quiz

    const quizInfo = requestAdminQuizInfo(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    if ('duration' in quizInfo.bodyString) {
      const testTotalDuration = quizInfo.bodyString.duration;
      expect(testTotalDuration).toStrictEqual(duration1 + duration2);
    }
  });

  test('Points awarded for question is not between 1 and 10 - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }

    const newQuestion2 = requestCreateQuestion(token, moreThanTen, quizId);

    if ('bodyString' in newQuestion2) {
      const newQuestionResponse = newQuestion2.bodyString;

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion2) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('The length of the answers must be between 1 and 30 characters - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }

    const newQuestion2 = requestCreateQuestion(token, moreThanThirty, quizId);

    if ('bodyString' in newQuestion2) {
      const newQuestionResponse = newQuestion2.bodyString;

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion2) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Answer strings are duplicates of one another - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('There are no correct answers - error code 400', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Testing Token is empty or invalid - error code 401', () => {
    requestClear();
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_401);
    }
  });

  test('Valid token is provided, but user is not an owner of this quiz - error code 403', () => {
    requestClear();
    // user1 created and user1's token creates quiz
    const user1 = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    const token = user1.body.token;
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
    const token2 = user2.body.token;
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

      if ('error' in newQuestionResponse) {
        const testErrorObject = { error: newQuestionResponse.error };
        expect(testErrorObject).toStrictEqual({
          error: expect.any(String),
        });
      }
    } else {
      expect(true).toStrictEqual(false);
    }
    if ('statusCode' in newQuestion) {
      const testStatusCode = newQuestion.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_403);
    }
  });
});

function requestUpdateQuestion(
  quizId: number,
  questionId: number,
  token: string,
  question: QuestionBody
): CreateQuizQuestionServerReturn {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
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

  return {
    bodyString: JSON.parse(res.body.toString()),
    statusCode: res.statusCode,
  };
}

describe('Testing PUT /v1/admin/quiz/:quizId/question/:questionId', () => {
  test('Testing valid question update ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );
        expect(result.bodyString).toStrictEqual({});
        expect(result.statusCode).toStrictEqual(RESPONSE_OK_200);
      }
    }
  });

  test('Testing valid question update with timeLastEdited changed', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;

        const quizBeforeUpdate = requestAdminQuizInfo(
          token,
          quizId
        ) as requestAdminQuizInfoReturn;
        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );
        const quizAfterUpdate = requestAdminQuizInfo(
          token,
          quizId
        ) as requestAdminQuizInfoReturn;
        expect(quizBeforeUpdate).not.toEqual(quizAfterUpdate);
        expect(result.statusCode).toStrictEqual(RESPONSE_OK_200);
      }
    }
  });

  test('Testing update question when answers is not between 2 and 6 - error code 400', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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

      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const shortAnswers = {
          question: 'What is the capital of Australia?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
          ],
        } as QuestionBody;

        // question id does not refer to valid question within quiz
        const response = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          shortAnswers
        );

        expect(response.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(response.statusCode).toStrictEqual(RESPONSE_ERROR_400);

        const longAnswers = {
          question: 'What is the capital of Australia?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
          ],
        } as QuestionBody;

        // question id does not refer to valid question within quiz
        const responseTwo = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          longAnswers
        );
        expect(responseTwo.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(responseTwo.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing update question with invalid question string length - error code 400', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        // question string is less than 5 characters and/or greater than 50 characters
        const shortLength = {
          question: 'W?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;

        // question length is less than 5 characters
        const shortResponse = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          shortLength
        );
        expect(shortResponse.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(shortResponse.statusCode).toStrictEqual(RESPONSE_ERROR_400);

        // question string is larger than 50 characters
        const longLength = {
          question: '12345678911 1234567891 1234567891 1234567891 1234567891?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;

        // question id does not refer to valid question within quiz
        const longResponse = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          longLength
        );
        expect(longResponse.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(longResponse.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing question update when question duration is not a positive number - error code 400 ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: -10,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );

        expect(result.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing question  update when question exceeds 3 minutes - error code 400 ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );
        expect(result.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing question update when points are between 1 and 10 - error code 400 ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 11,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;

        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );
        expect(result.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_400);

        const newQuestionTwo = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 0,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const resultTwo = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestionTwo
        );
        expect(resultTwo.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(resultTwo.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Length of answer must be between 1 and 30 characters ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const oneCharacter = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 11,
          answers: [
            {
              answer: '',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;

        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          oneCharacter
        );
        expect(result.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_400);

        const thirtyCharacters = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 0,
          answers: [
            {
              answer: 'qwertyuiopasdfghjklzxcvbnmqwertyuiopopsafhgjhkhl',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const resultTwo = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          thirtyCharacters
        );
        expect(resultTwo.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(resultTwo.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing invalid question update with duplicate answers - error code 400 ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 11,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Sydney',
              correct: false,
            },
          ],
        } as QuestionBody;

        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );
        expect(result.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing invalid question update when there are no correct answers - error code 400 ', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 200,
          points: 11,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: false,
            },
          ],
        } as QuestionBody;

        const result = requestUpdateQuestion(
          quizId,
          questionId,
          token,
          newQuestion
        );
        expect(result.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_400);
      }
    }
  });

  test('Testing invalid/empty token - error code 401', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(token, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const emptyToken = requestUpdateQuestion(
          quizId,
          questionId,
          '',
          newQuestion
        );
        expect(emptyToken.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(emptyToken.statusCode).toStrictEqual(RESPONSE_ERROR_401);

        const invalidToken = requestUpdateQuestion(
          quizId,
          questionId,
          'abcdefg',
          newQuestion
        );
        expect(invalidToken.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(invalidToken.statusCode).toStrictEqual(RESPONSE_ERROR_401);
      }
    }
  });

  test('Testing valid token provided, but wrong user - error code 403', () => {
    requestClear();
    const userOne = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const userTwo = requestAdminRegister(
      'jessica@hotmail.com',
      'hello1234566',
      'Jess',
      'Lily'
    );
    const tokenOne = userOne.body.token;
    const tokenTwo = userTwo.body.token;
    const newQuiz = requestAdminQuizCreate(
      tokenOne,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

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
      const question = requestCreateQuestion(tokenTwo, validQuestion, quizId);
      if ('questionId' in question.bodyString) {
        const questionId = question.bodyString.questionId as number;
        const newQuestion = {
          question: 'What is the capital of Australia?',
          duration: 2,
          points: 10,
          answers: [
            {
              answer: 'Sydney',
              correct: false,
            },
            {
              answer: 'Canberra',
              correct: true,
            },
          ],
        } as QuestionBody;
        const result = requestUpdateQuestion(
          quizId,
          questionId,
          tokenOne,
          newQuestion
        );
        expect(result).toStrictEqual({
          error: expect.any(String),
          errorCode: RESPONSE_ERROR_403,
        });
        expect(result.statusCode).toStrictEqual(RESPONSE_ERROR_403);
      }
    }
  });
});

function requestDuplicateQuestion(
  quizId: number,
  questionId: number,
  token: string
): CreateQuizQuestionServerReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`,
    {
      json: {
        token: token,
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

describe('Testing POST /v1/admin/quiz/:quizId/question/:questionId/duplicate', () => {
  test('Successful duplicate question', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;
      const QuestionOne = {
        question: 'First Question?',
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
      const QuestionTwo = {
        question: 'Second question?',
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
      // creates three questions
      requestCreateQuestion(token, QuestionOne, quizId);
      const resultTwo = requestCreateQuestion(token, QuestionTwo, quizId);
      if ('questionId' in resultTwo.bodyString) {
        const questionId = resultTwo.bodyString.questionId as number;
        // duplicate second question
        const duplicateResult = requestDuplicateQuestion(
          quizId,
          questionId,
          token
        );

        expect(duplicateResult.bodyString).toStrictEqual({
          newQuestionId: expect.any(Number),
        });
        expect(duplicateResult.statusCode).toStrictEqual(RESPONSE_OK_200);
        const result = requestAdminQuizInfo(token, quizId);
        if ('questions' in result.bodyString) {
          const questions = result.bodyString.questions;

          // there should be 3 questions now
          expect(questions.length).toStrictEqual(3);
          // expect the third question in the array to be the duplicated question
          // expect(questions[2]).toStrictEqual(duplicateResult.bodyString);
        }
      }
    }
  });

  test('QuestionId does not refer to valid question in this quiz - error code 400', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );
    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;
      const QuestionOne = {
        question: 'First Question?',
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
      requestCreateQuestion(token, QuestionOne, quizId);
      const duplicateResult = requestDuplicateQuestion(quizId, -1, token);
      expect(duplicateResult.bodyString).toStrictEqual({
        error: expect.any(String),
      });
      expect(duplicateResult.statusCode).toStrictEqual(RESPONSE_ERROR_400);
    }
  });

  test('Token is empty or invalid - error code 401', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );

    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

      const Question = {
        question: 'Second question?',
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

      const resultTwo = requestCreateQuestion(token, Question, quizId);
      if ('questionId' in resultTwo.bodyString) {
        const questionId = resultTwo.bodyString.questionId as number;

        const emptyToken = requestDuplicateQuestion(quizId, questionId, '');

        if ('error' in emptyToken.bodyString) {
          const errorObj = emptyToken.bodyString;
          expect(errorObj).toStrictEqual({
            error: expect.any(String),
          });
        }

        expect(emptyToken.statusCode).toStrictEqual(RESPONSE_ERROR_401);

        const invalidToken = requestDuplicateQuestion(
          quizId,
          questionId,
          'abcfde'
        );

        expect(invalidToken.bodyString).toStrictEqual({
          error: expect.any(String),
        });
        expect(invalidToken.statusCode).toStrictEqual(RESPONSE_ERROR_401);
      }
    }
  });

  test('Valid token is provided, but user does not own quiz - error code 403', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const newUserTwo = requestAdminRegister(
      'annleee@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const tokenTwo = newUserTwo.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    );

    if ('quizId' in newQuiz.bodyString) {
      const quizId = newQuiz.bodyString.quizId;

      const Question = {
        question: 'Second question?',
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

      const result = requestCreateQuestion(tokenTwo, Question, quizId);
      if ('questionId' in result.bodyString) {
        const questionId = result.bodyString.questionId as number;

        const invalidToken = requestDuplicateQuestion(quizId, questionId, '');
        expect(invalidToken.bodyString).toStrictEqual({
          error: expect.any(Number),
        });
        expect(invalidToken.statusCode).toStrictEqual(RESPONSE_ERROR_403);
      }
    }
  });
});
