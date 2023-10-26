import request from 'sync-request-curl';
import config from './config.json';
import { requestAdminRegister } from './auth_2.test';
import { requestAdminQuizCreate, requestAdminQuizInfo, requestClear } from './quiz_2.test';
import { QuestionBody } from './library/interfaces';
import { RESPONSE_ERROR_400, RESPONSE_ERROR_401, RESPONSE_ERROR_403 } from './library/constants';
import { requestCreateQuestion } from './quiz_2_questionDelete.test';
import { Quizzes } from './dataStore';
const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

interface QuizId {
  quizId: number;
}

interface QuestionId {
  questionId: number;
}

interface CreateQuizQuestionReturn {
  createQuizQuestionResponse: QuestionId;
}

export function requestAdminQuizQuestionMove(token: string, quizId: number, questionId: number, newPosition: number) {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}/move`,
    {
      json: { quizId, questionId, token, newPosition }
    }
  );

  const bodyString = JSON.parse(res.body.toString());
  return { statusCode: res.statusCode, bodyString: bodyString };
}

describe('AdminQuizQuestionMove testing', () => {
  test('StatusCode 200: Valid input', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
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
        }
      ]
    } as QuestionBody;
    const questionOne = requestCreateQuestion(token, validQuestionOne, newQuiz.quizId).bodyString as CreateQuizQuestionReturn;
    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        { answer: 'Canberra', correct: true }, { answer: 'Sydney', correct: false }
      ]
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;
    const oldQuizInfo = requestAdminQuizInfo(token, newQuiz.quizId).bodyString as Quizzes;
    const TimeBefore = expect(oldQuizInfo.timeLastEdited);
    const validQuestionThree = {
      question: 'What is the capital of the USA?',
      duration: 2,
      answers: [
        { answer: 'Washington, D.C', correct: true }, { answer: 'New York', correct: false }
      ]
    } as QuestionBody;

    const questionThree = requestCreateQuestion(
      token,
      validQuestionThree,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;
    requestAdminQuizQuestionMove(token, newQuiz.quizId, questionTwo.createQuizQuestionResponse.questionId, 0);
    const newQuizInfo = requestAdminQuizInfo(token, newQuiz.quizId).bodyString as Quizzes;
    expect(newQuizInfo.questions[0].questionId).toStrictEqual(questionTwo.createQuizQuestionResponse.questionId);
    expect(newQuizInfo.questions[1].questionId).toStrictEqual(questionOne.createQuizQuestionResponse.questionId);
    expect(newQuizInfo.questions[2].questionId).toStrictEqual(questionThree.createQuizQuestionResponse.questionId);
    const TimeAfter = expect(newQuizInfo.timeLastEdited);
    expect(TimeBefore).not.toEqual(TimeAfter);
  });

  test('Error 400: New position is less than 0.', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [{ answer: 'Blue', correct: true }, { answer: 'Green', correct: false }]
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

    const InvalidPositionNum = requestAdminQuizQuestionMove(token, newQuiz.quizId, questionOne.createQuizQuestionResponse.questionId, -1);
    expect(InvalidPositionNum.statusCode).toBe(RESPONSE_ERROR_400);
    expect(InvalidPositionNum.bodyString).toStrictEqual({ error: expect.any(String) });
  });
  test('Error 400: New position is more than 1 less than the number of question.', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [{ answer: 'Blue', correct: true }, { answer: 'Green', correct: false }]
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

    const InvalidPositionNum = requestAdminQuizQuestionMove(token,
      newQuiz.quizId,
      questionOne.createQuizQuestionResponse.questionId,
      3
    );

    expect(InvalidPositionNum.statusCode).toBe(RESPONSE_ERROR_400);
    expect(InvalidPositionNum.bodyString).toStrictEqual({ error: expect.any(String) });
  });

  test('Error 400: New position is the current position of the question.', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
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
      ]
    } as QuestionBody;
    const questionOne = requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

    const InvalidPositionNum = requestAdminQuizQuestionMove(token, newQuiz.quizId, questionOne.createQuizQuestionResponse.questionId, 0);
    expect(InvalidPositionNum.statusCode).toBe(RESPONSE_ERROR_400);
    expect(InvalidPositionNum.bodyString).toStrictEqual({ error: expect.any(String) });
  });

  test('Error 400: QuestionId does not refer to a valid question with this quiz', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
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
    requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

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
        }

      ]
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

    const invalidQuestionId = requestAdminQuizQuestionMove(token,
      newQuiz.quizId,
      -1 * (999 + questionTwo.createQuizQuestionResponse.questionId),
      0);
    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_400);
    expect(invalidQuestionId.bodyString).toStrictEqual({ error: expect.any(String) });
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
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
    requestCreateQuestion(token, validQuestionOne, newQuiz.quizId).bodyString as CreateQuizQuestionReturn;
    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [{ answer: 'Canberra', correct: true }, { answer: 'Sydney', correct: false }]
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(token, validQuestionTwo, newQuiz.quizId).bodyString as CreateQuizQuestionReturn;
    const invalidQuestionId = requestAdminQuizQuestionMove('invalidToken#', newQuiz.quizId, questionTwo.createQuizQuestionResponse.questionId, 0);
    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidQuestionId.bodyString).toStrictEqual({ error: expect.any(String) });
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [{ answer: 'Blue', correct: true }, { answer: 'Green', correct: false }]
    } as QuestionBody;

    requestCreateQuestion(token, validQuestionOne, newQuiz.quizId).bodyString as CreateQuizQuestionReturn;
    const validQuestionTwo = {
      question: 'What is the capital of Australia?',
      duration: 2,
      points: 10,
      answers: [
        {
          answer: 'Canberra',
          correct: true
        },
        {
          answer: 'Sydney',
          correct: false
        }
      ]
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

    const invalidQuestionId = requestAdminQuizQuestionMove('', newQuiz.quizId, questionTwo.createQuizQuestionResponse.questionId, 0);

    expect(invalidQuestionId.statusCode).toBe(RESPONSE_ERROR_401);
    expect(invalidQuestionId.bodyString).toStrictEqual({ error: expect.any(String) });
  });

  test('Error 403: Valid token but user is not an owner of this quiz', () => {
    requestClear();
    const newUser = requestAdminRegister('ann@hotmail.com', 'hello1234566', 'Ann', 'Lee');
    const newUser2 = requestAdminRegister('tony@hotmail.com', 'bye1234566', 'Tony', 'Stark');
    const token2 = newUser2.body.token;
    const token = newUser.body.token;
    const newQuiz = requestAdminQuizCreate(token, 'New Quiz One', 'Quiz Description One').bodyString as QuizId;
    const validQuestionOne = {
      question: 'What color is the sky?',
      duration: 2,
      points: 10,
      answers: [{
        answer: 'Blue',
        correct: true
      },
      {
        answer: 'Green',
        correct: false
      }]
    } as QuestionBody;
    requestCreateQuestion(
      token,
      validQuestionOne,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

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
        }
      ]
    } as QuestionBody;

    const questionTwo = requestCreateQuestion(
      token,
      validQuestionTwo,
      newQuiz.quizId
    ).bodyString as CreateQuizQuestionReturn;

    const invalidToken = requestAdminQuizQuestionMove(token2, newQuiz.quizId, questionTwo.createQuizQuestionResponse.questionId, 0);

    expect(invalidToken.statusCode).toBe(RESPONSE_ERROR_403);
    expect(invalidToken.bodyString).toStrictEqual({ error: expect.any(String) });
  });
});
