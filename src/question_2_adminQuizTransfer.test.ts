import request from 'sync-request-curl';
import config from './config.json';
import { requestDelete, requestAdminRegister } from './auth_2.test';
import { requestAdminQuizCreate, requestAdminQuizInfo } from './quiz_2.test';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from './library/constants';

import {
  QuestionBody,
  CreateQuizQuestionReturn,
  ErrorObjectWithCode,
} from './library/interfaces';
import { NumericLiteral } from 'typescript';

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// interfaces used throughout file - START

interface QuizId {
  quizId: number;
}

export interface CreateQuizQuestionServerReturn {
  bodyString: CreateQuizQuestionReturn;
  statusCode: number;
}

export interface TransferQuizReturn {
  transferQuizResponse: Record<string, never> | ErrorObjectWithCode;
}

interface TransferQuizServerReturn {
  bodyString: TransferQuizReturn;
  statusCode: number;
}

// interfaces used throughout file - END

// functions to call server routes used in this file - START

function requestTransferQuestion(
  token: string,
  userEmail: string,
  quizId: number
): TransferQuizServerReturn {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    {
      json: {
        token,
        userEmail,
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

// functions to call server routes used in this file - END

// Start of testing suite - START
// From swagger:
// Transfer the quiz to another owner

describe('Testing POST /v1/admin/quiz/${quizId}/transfer', () => {
  test('Testing successful transferring a quiz - EXPECT SUCCESS 200', () => {
    requestDelete();

    const user1Email = 'abc@hotmail.com';
    const user2Email = 'xyz@hotmail.com';
    // create user 1
    const user1 = requestAdminRegister(
      user1Email,
      'abcde42841',
      'Ann',
      'Arthur'
    );
    // user 1 token
    const tokenUser1 = user1.body.token as string;
    // user 1 quiz 1
    const quizUser1CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser1,
      'User 1 Quiz 1',
      'This is quiz 1 about user 1'
    ).bodyString as QuizId;

    // User 1 quiz 1 quizid
    const quizId1User1 = quizUser1CreateQuiz1Response.quizId;

    // user 1 quiz 2
    const quizUser1CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser1,
      'User 1 Quiz 2',
      'This is quiz 2 about user 1'
    ).bodyString as QuizId;

    // User 1 quiz 2 quizid
    const quizId2User1 = quizUser1CreateQuiz2Response.quizId;

    // create user 2
    const user2 = requestAdminRegister(
      user2Email,
      'abcde4284',
      'Xavier',
      'Xylophone'
    );
    // user 2 token
    const tokenUser2 = user2.body.token as string;
    // user 2 quiz 1
    const quizUser2CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 1',
      'This is quiz 1 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

    // user 2 quiz 2
    const quizUser2CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 2',
      'This is quiz 2 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 2 quizid
    const quizId2User2 = quizUser2CreateQuiz2Response.quizId;

    // Transfer user 2's quiz 1 to user 1

    // Transferee's email address:
    const transfereeEmail = user1Email;
    // Trasnferor's token
    const transferorToken = tokenUser2;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      transferorToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for blank object

    expect(transferResponseTest).toStrictEqual({});

    // check for status code 200

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_OK_200);
    // ######
    // 1. check that transferor no longer has the quiz
    // 2. check that the transferee has the quiz
  });

  test('Testing transferee userEmail is not a real user - error code 400', () => {
    requestDelete();
    const user1Email = 'abc@hotmail.com';
    const user2Email = 'xyz@hotmail.com';

    // create user 2
    const user2 = requestAdminRegister(
      user2Email,
      'abcde4284',
      'Xavier',
      'Xylophone'
    );
    // user 2 token
    const tokenUser2 = user2.body.token as string;
    // user 2 quiz 1
    const quizUser2CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 1',
      'This is quiz 1 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

    // user 2 quiz 2
    const quizUser2CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 2',
      'This is quiz 2 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 2 quizid
    const quizId2User2 = quizUser2CreateQuiz2Response.quizId;

    // Transfer user 2's quiz 1 to user 1

    // Transferee's email address: DOES NOT EXIST - HAS NOT BEEN CREATED
    const transfereeEmail = user1Email;
    // Trasnferor's token
    const transferorToken = tokenUser2;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      transferorToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for error object

    expect(transferResponseTest).toStrictEqual({ error: expect.any(String) });

    // check for status code 400

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_ERROR_400);
  });

  test('Testing userEmail is the current logged in user - error code 400', () => {
    requestDelete();
    const user1Email = 'abc@hotmail.com';
    const user2Email = 'xyz@hotmail.com';

    // create user 2
    const user2 = requestAdminRegister(
      user2Email,
      'abcde4284',
      'Xavier',
      'Xylophone'
    );
    // user 2 token
    const tokenUser2 = user2.body.token as string;
    // user 2 quiz 1
    const quizUser2CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 1',
      'This is quiz 1 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

    // user 2 quiz 2
    const quizUser2CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 2',
      'This is quiz 2 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 2 quizid
    const quizId2User2 = quizUser2CreateQuiz2Response.quizId;

    // Transfer user 2's quiz 1 to user 1

    // Transferee's email address: IS THE CURRENT LOGGED IN USER: USER 2
    const transfereeEmail = user2Email;
    // Trasnferor's token
    const transferorToken = tokenUser2;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      transferorToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for error object

    expect(transferResponseTest).toStrictEqual({ error: expect.any(String) });

    // check for status code 400

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_ERROR_400);
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user - error code 400', () => {
    requestDelete();

    const user1Email = 'abc@hotmail.com';
    const user2Email = 'xyz@hotmail.com';
    // create user 1
    const user1 = requestAdminRegister(
      user1Email,
      'abcde42841',
      'Ann',
      'Arthur'
    );
    // user 1 token
    const tokenUser1 = user1.body.token as string;
    // user 1 quiz 1
    const quizUser1CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser1,
      'Quiz 1',
      'This is quiz about COMP1531'
    ).bodyString as QuizId;

    // User 1 quiz 1 quizid
    const quizId1User1 = quizUser1CreateQuiz1Response.quizId;

    // user 1 quiz 2
    const quizUser1CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser1,
      'Quiz 2',
      'This is quiz about COMP1511'
    ).bodyString as QuizId;

    // User 1 quiz 2 quizid
    const quizId2User1 = quizUser1CreateQuiz2Response.quizId;

    // create user 2
    const user2 = requestAdminRegister(
      user2Email,
      'abcde4284',
      'Xavier',
      'Xylophone'
    );
    // user 2 token
    const tokenUser2 = user2.body.token as string;
    // user 2 quiz 1
    const quizUser2CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser2,
      'Quiz 1',
      'This is quiz about COMP1531'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

    // user 2 quiz 2
    const quizUser2CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser2,
      'Quiz 2',
      'This is quiz about COMP1511'
    ).bodyString as QuizId;

    // User 2 quiz 2 quizid
    const quizId2User2 = quizUser2CreateQuiz2Response.quizId;

    // Transfer user 2's quiz 1 to user 1
    // will error as user 2's quiz 1 has the
    // same name as one of user 1's quizzes

    // Transferee's email address:
    const transfereeEmail = user1Email;
    // Trasnferor's token
    const transferorToken = tokenUser2;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      transferorToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for blank object

    expect(transferResponseTest).toStrictEqual({ error: expect.any(String) });

    // check for status code 200

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_ERROR_400);
  });

  test('Token is empty or invalid (does not refer to valid logged in user session) - error code 401', () => {
    requestDelete();

    const user2Email = 'xyz@hotmail.com';

    // create user 2
    const user2 = requestAdminRegister(
      user2Email,
      'abcde4284',
      'Xavier',
      'Xylophone'
    );
    // user 2 token
    const tokenUser2 = user2.body.token as string;
    // user 2 quiz 1
    const quizUser2CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 1',
      'This is quiz 1 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

    // user 2 quiz 2
    const quizUser2CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 2',
      'This is quiz 2 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 2 quizid
    const quizId2User2 = quizUser2CreateQuiz2Response.quizId;

    // Transfer user 2's quiz 1 to user 1

    // Transferee's email address:
    // will error as invalid token used
    const transfereeEmail = user2Email;
    // Trasnferor's token
    let invalidToken;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      invalidToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for error object

    expect(transferResponseTest).toStrictEqual({ error: expect.any(String) });

    // check for status code 401

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_ERROR_401);
  });

  test('Valid token is provided, but user is not an owner of this quiz - error code 403', () => {
    requestDelete();

    const user1Email = 'abc@hotmail.com';
    const user2Email = 'xyz@hotmail.com';
    // create user 1
    const user1 = requestAdminRegister(
      user1Email,
      'abcde42841',
      'Ann',
      'Arthur'
    );
    // user 1 token
    const tokenUser1 = user1.body.token as string;
    // user 1 quiz 1
    const quizUser1CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser1,
      'User 1 Quiz 1',
      'This is quiz 1 about user 1'
    ).bodyString as QuizId;

    // User 1 quiz 1 quizid
    const quizId1User1 = quizUser1CreateQuiz1Response.quizId;

    // user 1 quiz 2
    const quizUser1CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser1,
      'User 1 Quiz 2',
      'This is quiz 2 about user 1'
    ).bodyString as QuizId;

    // User 1 quiz 2 quizid
    const quizId2User1 = quizUser1CreateQuiz2Response.quizId;

    // create user 2
    const user2 = requestAdminRegister(
      user2Email,
      'abcde4284',
      'Xavier',
      'Xylophone'
    );
    // user 2 token
    const tokenUser2 = user2.body.token as string;
    // user 2 quiz 1
    const quizUser2CreateQuiz1Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 1',
      'This is quiz 1 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

    // user 2 quiz 2
    const quizUser2CreateQuiz2Response = requestAdminQuizCreate(
      tokenUser2,
      'User 2 Quiz 2',
      'This is quiz 2 about user 2'
    ).bodyString as QuizId;

    // User 2 quiz 2 quizid
    const quizId2User2 = quizUser2CreateQuiz2Response.quizId;

    // Transfer user 2's quiz 1 to user 1: BUT
    // use Transferee's token,
    // ie Trasnferee is not an onwer of this quiz, so can't transfer
    // Transferee's email address:
    const transfereeEmail = user1Email;
    // Trasnferor's token
    const transferorToken = tokenUser2;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      transferorToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for blank object

    expect(transferResponseTest).toStrictEqual({ error: expect.any(String) });

    // check for status code 200

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_ERROR_403);
  });
});
