import HTTPError from 'http-errors';
import { requestAdminQuizCreate, requestAdminQuizInfo, requestAdminQuizQuestionMove, requestAdminRegister, requestClear, requestCreateQuestion, requestDeleteQuizQuestion, requestDuplicateQuestion, requestUpdateQuestion } from './library/route_testing_functions';
import { QuestionBody, QuestionId, QuizId, TokenString, requestAdminQuizInfoReturn } from './library/interfaces';
import { RESPONSE_ERROR_400, RESPONSE_ERROR_401, RESPONSE_ERROR_403, RESPONSE_OK_200 } from './library/constants';
import { Quizzes } from './dataStore';

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

describe('deleteQuizQuestion testing', () => {
  test('StatusCode 200: Valid input', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
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
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;

    requestDeleteQuizQuestion(
      testToken,
      QuizOne.quizId,
      questionOne.questionId
    );
    const quiz1Info = requestAdminQuizInfo(testToken, QuizOne.quizId);
    expect(quiz1Info.bodyString).toStrictEqual({
      quizId: QuizOne.quizId,
      name: 'Quiz One',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'this is my first quiz',
      numQuestions: 0,
      questions: [],
      duration: 0,
    });
  });

  test('Error 400: QuizId does not refer to a valid quiz', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
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
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const invalidQuizId = requestDeleteQuizQuestion(
      testToken,
      -1 * (QuizOne.quizId + 1531),
      questionOne.questionId
    );
    expect(invalidQuizId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuizId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: QuestionId does not refer to a valid question with this quiz', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
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
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const invalidQuestionId = requestDeleteQuizQuestion(
      testToken,
      QuizOne.quizId,
      -1 * (1531 + questionOne.questionId)
    );
    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuestionId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
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
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const invalidToken = requestDeleteQuizQuestion(
      'invalid',
      QuizOne.quizId,
      questionOne.questionId
    );
    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;
    const testToken = returnTokenObj.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
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
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    const emptyToken = requestDeleteQuizQuestion(
      '',
      -1 * QuizOne.quizId,
      questionOne.questionId
    );
    expect(emptyToken.statusCode).toBe(RESPONSE_ERROR_401);
    expect(emptyToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Valid token but user is not an owner of this quiz', () => {
    requestClear();
    requestClear();
    // create user 1
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    ).body as TokenString;

    const testToken = returnTokenObj.token;
    // create user 2
    const returnTokenObj2 = requestAdminRegister(
      'tony@hotmail.com',
      'ab123456b',
      'Tony',
      'Stark'
    ).body as TokenString;

    const testToken2 = returnTokenObj2.token;

    // Create quiz using jack@hotmail.com token
    const JackQuiz = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'This a quiz by Jack'
    ).bodyString as QuizId;

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
    const questionOne = requestCreateQuestion(
      testToken,
      validQuestion,
      JackQuiz.quizId
    ).bodyString as QuestionId;
    const quizIdNotReferToUser1 = requestDeleteQuizQuestion(
      testToken2,
      JackQuiz.quizId,
      questionOne.questionId
    );
    expect(quizIdNotReferToUser1.statusCode).toBe(RESPONSE_ERROR_403);
    expect(quizIdNotReferToUser1.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});

describe('AdminQuizQuestionMove testing', () => {
  test('StatusCode 200: Valid input', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
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
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;
    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;
    const oldQuizInfo = requestAdminQuizInfo(token, newQuiz.quizId)
      .bodyString as Quizzes;
    const TimeBefore = expect(oldQuizInfo.timeLastEdited);
    const validQuestionThree = {
      question: 'What is the capital of the USA?',
      duration: 2,
      answers: [
        { answer: 'Washington, D.C', correct: true },
        { answer: 'New York', correct: false },
      ],
    } as QuestionBody;

    const questionThree = requestCreateQuestion(
      token,
      validQuestionThree,
      newQuiz.quizId
    ).bodyString as QuestionId;
    requestAdminQuizQuestionMove(
      token,
      newQuiz.quizId,
      questionTwo.questionId,
      0
    );
    const newQuizInfo = requestAdminQuizInfo(token, newQuiz.quizId)
      .bodyString as Quizzes;
    expect(newQuizInfo.questions[0].questionId).toStrictEqual(
      questionTwo.questionId
    );
    expect(newQuizInfo.questions[1].questionId).toStrictEqual(
      questionOne.questionId
    );
    expect(newQuizInfo.questions[2].questionId).toStrictEqual(
      questionThree.questionId
    );
    const TimeAfter = expect(newQuizInfo.timeLastEdited);
    expect(TimeBefore).not.toEqual(TimeAfter);
  });

  test('Error 400: New position is less than 0.', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'Blue', correct: true },
        { answer: 'Green', correct: false },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;

    const InvalidPositionNum = requestAdminQuizQuestionMove(
      token,
      newQuiz.quizId,
      questionOne.questionId,
      -1
    );
    expect(InvalidPositionNum.statusCode).toBe(RESPONSE_ERROR_400);
    expect(InvalidPositionNum.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
  test('Error 400: New position is more than 1 less than the number of question.', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'Blue', correct: true },
        { answer: 'Green', correct: false },
      ],
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;

    const InvalidPositionNum = requestAdminQuizQuestionMove(
      token,
      newQuiz.quizId,
      questionOne.questionId,
      3
    );

    expect(InvalidPositionNum.statusCode).toBe(RESPONSE_ERROR_400);
    expect(InvalidPositionNum.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: New position is the current position of the question.', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
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
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;

    const InvalidPositionNum = requestAdminQuizQuestionMove(
      token,
      newQuiz.quizId,
      questionOne.questionId,
      0
    );
    expect(InvalidPositionNum.statusCode).toBe(RESPONSE_ERROR_400);
    expect(InvalidPositionNum.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 400: QuestionId does not refer to a valid question with this quiz', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
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
    requestCreateQuestion(token, validQuestionOne, newQuiz.quizId)
      .bodyString as QuestionId;

    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Canberra',
          correct: true,
        },
        {
          answer: 'Sydney',
          correct: false,
        },
      ],
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;

    const invalidQuestionId = requestAdminQuizQuestionMove(
      token,
      newQuiz.quizId,
      -1 * (999 + questionTwo.questionId),
      0
    );
    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuestionId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is invalid', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
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
    requestCreateQuestion(token, validQuestionOne, newQuiz.quizId)
      .bodyString as QuestionId;
    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'Canberra', correct: true },
        { answer: 'Sydney', correct: false },
      ],
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;
    const invalidQuestionId = requestAdminQuizQuestionMove(
      'invalidToken#',
      newQuiz.quizId,
      questionTwo.questionId,
      0
    );
    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidQuestionId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 401: Token is empty', () => {
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
    ).bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'Blue', correct: true },
        { answer: 'Green', correct: false },
      ],
    } as QuestionBody;

    requestCreateQuestion(token, validQuestionOne, newQuiz.quizId)
      .bodyString as QuestionId;
    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Canberra',
          correct: true,
        },
        {
          answer: 'Sydney',
          correct: false,
        },
      ],
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;

    const invalidQuestionId = requestAdminQuizQuestionMove(
      '',
      newQuiz.quizId,
      questionTwo.questionId,
      0
    );

    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidQuestionId.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });

  test('Error 403: Valid token but user is not an owner of this quiz', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const newUser2 = requestAdminRegister(
      'tony@hotmail.com',
      'bye1234566',
      'Tony',
      'Stark'
    );
    const token2 = newUser2.body.token;
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(
      token,
      'New Quiz One',
      'Quiz Description One'
    ).bodyString as QuizId;
    const validQuestionOne = {
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
    requestCreateQuestion(token, validQuestionOne, newQuiz.quizId)
      .bodyString as QuestionId;

    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Canberra',
          correct: true,
        },
        {
          answer: 'Sydney',
          correct: false,
        },
      ],
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;

    const invalidToken = requestAdminQuizQuestionMove(
      token2,
      newQuiz.quizId,
      questionTwo.questionId,
      0
    );

    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_403);
    expect(invalidToken.bodyString).toStrictEqual({
      error: expect.any(String),
    });
  });
});
