import {
  requestClear,
  requestAdminQuizCreate,
  requestAdminQuizInfo,
  requestAdminRegister,
  requestCreateQuestion,
  requestAdminQuizQuestionMove,
} from '../library/route_testing_functions';
import { QuestionBody, QuestionId, QuizId } from '../library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from '../library/constants';
// import { requestCreateQuestion } from './quiz_2_questionDelete.test';
import { Quizzes } from '../dataStore';

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
