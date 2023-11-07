import HTTPError from 'http-errors';
import {
  requestAdminQuizCreateV2,
  requestAdminQuizInfo,
  requestAdminQuizQuestionMoveV2,
  requestAdminRegister,
  requestClear,
  requestCreateQuestionV2,
  requestDeleteQuizQuestionV2,
  requestDuplicateQuestionV2,
  requestUpdateQuestionV2,
} from './library/route_testing_functions';
import {
  QuestionBody,
  QuestionId,
  QuizId,
  TokenString,
  requestAdminQuizInfoReturn,
} from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  RESPONSE_OK_200,
} from './library/constants';
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        const result = requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
        );
        expect(result).toStrictEqual({});
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        const result = requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
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
    const newQuiz = requestAdminQuizCreateV2(
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

      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          shortAnswers,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          longAnswers,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          shortLength,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);

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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          longLength,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);

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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestionTwo,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          oneCharacter,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);

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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          thirtyCharacters,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          token,
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          '',
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_401]);
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          'token',
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_401]);
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
    const newQuiz = requestAdminQuizCreateV2(
      tokenTwo,
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
      const question = requestCreateQuestionV2(tokenTwo, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          tokenOne,
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_403]);
      }
    }
  });

  test('Testing invalid thumbnailUrl - error code 400', () => {
    requestClear();
    const newUser = requestAdminRegister(
      'ann@hotmail.com',
      'hello1234566',
      'Ann',
      'Lee'
    );
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreateV2(
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
      const question = requestCreateQuestionV2(token, validQuestion, quizId);
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
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          '',
          newQuestion,
          ''
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          'token',
          newQuestion,
          'thumbnailUrl'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
        expect(() => requestUpdateQuestionV2(
          quizId,
          questionId,
          'token',
          newQuestion,
          'thumbnailUrl.ts'
        )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      requestCreateQuestionV2(token, QuestionOne, quizId);
      const resultTwo = requestCreateQuestionV2(token, QuestionTwo, quizId);
      if ('questionId' in resultTwo.bodyString) {
        const questionId = resultTwo.bodyString.questionId as number;
        // duplicate second question
        const duplicateResult = requestDuplicateQuestionV2(
          quizId,
          questionId,
          token
        );

        expect(duplicateResult).toStrictEqual({
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
    const newQuiz = requestAdminQuizCreateV2(
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
      requestCreateQuestionV2(token, QuestionOne, quizId);
      expect(() => requestDuplicateQuestionV2(
        quizId,
        -1,
        token
      )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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

      const resultTwo = requestCreateQuestionV2(token, Question, quizId);
      if ('questionId' in resultTwo.bodyString) {
        const questionId = resultTwo.bodyString.questionId as number;
        expect(() => requestDuplicateQuestionV2(
          quizId,
          questionId,
          ''
        )).toThrow(HTTPError[RESPONSE_ERROR_401]);

        expect(() => requestDuplicateQuestionV2(
          quizId,
          questionId,
          'token'
        )).toThrow(HTTPError[RESPONSE_ERROR_401]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
      const result = requestCreateQuestionV2(token, Question, quizId);
      if ('questionId' in result.bodyString) {
        const questionId = result.bodyString.questionId as number;
        expect(() => requestDuplicateQuestionV2(
          quizId,
          questionId,
          tokenTwo
        )).toThrow(HTTPError[RESPONSE_ERROR_403]);
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

    const QuizOne = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;

    requestDeleteQuizQuestionV2(
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

    const QuizOne = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    expect(() => requestDeleteQuizQuestionV2(
      testToken,
      -1 * (QuizOne.quizId + 1531),
      questionOne.questionId
    )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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

    const QuizOne = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    expect(() => requestDeleteQuizQuestionV2(
      testToken,
      QuizOne.quizId,
      -1 * (1531 + questionOne.questionId)
    )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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

    const QuizOne = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    expect(() => requestDeleteQuizQuestionV2(
      'invalid',
      QuizOne.quizId,
      questionOne.questionId
    )).toThrow(HTTPError[RESPONSE_ERROR_401]);
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

    const QuizOne = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      testToken,
      validQuestion,
      QuizOne.quizId
    ).bodyString as QuestionId;
    expect(() => requestDeleteQuizQuestionV2(
      '',
      -1 * QuizOne.quizId,
      questionOne.questionId
    )).toThrow(HTTPError[RESPONSE_ERROR_401]);
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
    const JackQuiz = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      testToken,
      validQuestion,
      JackQuiz.quizId
    ).bodyString as QuestionId;
    expect(() => requestDeleteQuizQuestionV2(
      testToken2,
      JackQuiz.quizId,
      questionOne.questionId
    )).toThrow(HTTPError[RESPONSE_ERROR_403]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
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

    const questionTwo = requestCreateQuestionV2(
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

    const questionThree = requestCreateQuestionV2(
      token,
      validQuestionThree,
      newQuiz.quizId
    ).bodyString as QuestionId;
    requestAdminQuizQuestionMoveV2(
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
    const newQuiz = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;
    expect(() => requestAdminQuizQuestionMoveV2(
      token,
      newQuiz.quizId,
      questionOne.questionId,
      -1
    )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;

    expect(() => requestAdminQuizQuestionMoveV2(
      token,
      newQuiz.quizId,
      questionOne.questionId,
      3
    )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
    const questionOne = requestCreateQuestionV2(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as QuestionId;

    expect(() => requestAdminQuizQuestionMoveV2(
      token,
      newQuiz.quizId,
      questionOne.questionId,
      0
    )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
    requestCreateQuestionV2(token, validQuestionOne, newQuiz.quizId)
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

    const questionTwo = requestCreateQuestionV2(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;
    expect(() => requestAdminQuizQuestionMoveV2(
      token,
      newQuiz.quizId,
      -1 * (999 + questionTwo.questionId),
      1
    )).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
    requestCreateQuestionV2(token, validQuestionOne, newQuiz.quizId)
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

    const questionTwo = requestCreateQuestionV2(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;
    expect(() => requestAdminQuizQuestionMoveV2(
      'token',
      newQuiz.quizId,
      questionTwo.questionId,
      1
    )).toThrow(HTTPError[RESPONSE_ERROR_401]);
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
    const newQuiz = requestAdminQuizCreateV2(
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

    requestCreateQuestionV2(token, validQuestionOne, newQuiz.quizId)
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

    const questionTwo = requestCreateQuestionV2(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;
    expect(() => requestAdminQuizQuestionMoveV2(
      '',
      newQuiz.quizId,
      questionTwo.questionId,
      1
    )).toThrow(HTTPError[RESPONSE_ERROR_401]);
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
    const newQuiz = requestAdminQuizCreateV2(
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
    requestCreateQuestionV2(token, validQuestionOne, newQuiz.quizId)
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

    const questionTwo = requestCreateQuestionV2(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as QuestionId;
    expect(() => requestAdminQuizQuestionMoveV2(
      token2,
      newQuiz.quizId,
      questionTwo.questionId,
      0
    )).toThrow(HTTPError[RESPONSE_ERROR_403]);
  });
});
