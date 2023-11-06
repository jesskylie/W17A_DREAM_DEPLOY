import request from 'sync-request-curl';
import config from '../config.json';

import {
  requestClear,
  requestAdminRegister,
} from '../library/route_testing_functions';

import {
  requestAdminQuizCreate,
  requestAdminQuizList,
} from '../library/route_testing_functions';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
} from '../library/constants';

import {
  CreateQuizQuestionReturn,
  ErrorObjectWithCode,
  requestAdminQuizListReturn,
  TransferQuizReturn,
  TransferQuizServerReturn
} from '../library/interfaces';

// constants used throughout file - START
import {
  requestTransferQuestion
} from '../library/route_testing_functions'
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



// interfaces used throughout file - END

// functions to call server routes used in this file - START

// functions to call server routes used in this file - END

// helper functions used in this file - START

interface SmallQuizArray {
  quizId: number;
  name: string;
}

/**
 * Function to test quizId appears in array
 *
 * @param {SmallQuizArray[]} quizArray - the quiz array
 * @param {number} targetQuizId - the name of the quiz
 * ...
 *
 * @returns {boolean} - true quizId is in array | false if quizId is not in array
 */
function doesQuizExist(
  quizArray: SmallQuizArray[],
  targetQuizId: number
): boolean {
  for (const quizObj of quizArray) {
    if (quizObj.quizId === targetQuizId) {
      return true;
    }
  }
  return false;
}

// helper functions used in this file - END

// Start of testing suite - START
// From swagger:
// Transfer the quiz to another owner

describe('Testing POST adminQuizTransfer', () => {
  test('Testing successful transferring a quiz - EXPECT SUCCESS 200', () => {
    requestClear();

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
    // Test that quizIdUser2 now appears in quizzes owned by user 1
    // get list of all quizzes owned by user 1
    const user1Quizzes: requestAdminQuizListReturn =
      requestAdminQuizList(tokenUser1);

    if ('quizzes' in user1Quizzes.bodyString) {
      const quizzesTest = user1Quizzes.bodyString;
      const user1QuizArray = quizzesTest.quizzes as SmallQuizArray[];
      const doesTransferredQuizAppearInTransfereeArrayTest = doesQuizExist(
        user1QuizArray,
        quizId1User2
      ) as boolean;
      expect(doesTransferredQuizAppearInTransfereeArrayTest).toStrictEqual(
        true
      );
    }

    // Test that quizIdUser2 now no longer appears in quizzes owned by user 2
    // get list of all quizzes owned by user 1
    const user2Quizzes: requestAdminQuizListReturn =
      requestAdminQuizList(tokenUser2);

    if ('quizzes' in user2Quizzes.bodyString) {
      const quizzes2Test = user2Quizzes.bodyString;
      const user2QuizArray = quizzes2Test.quizzes as SmallQuizArray[];
      const doesTransferredQuizAppearInTransfereeArrayTest = doesQuizExist(
        user2QuizArray,
        quizId1User2
      ) as boolean;
      expect(doesTransferredQuizAppearInTransfereeArrayTest).toStrictEqual(
        false
      );
    }
  });

  test('Testing transferee userEmail is not a real user - error code 400', () => {
    requestClear();
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

  test('Testing transferee userEmail is not a real user (invalid email) - error code 400', () => {
    requestClear();
    const user1Email = 'abc@hotmail';
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

    // Transfer user 2's quiz 1 to user 1

    // Transferee's email address: EMAIL ADDRESS IS NOT A VALID EMAIL
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
    requestClear();
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
    requestClear();

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
      'Quiz 1',
      'This is quiz about COMP1531'
    ).bodyString as QuizId;

    // User 2 quiz 1 quizid
    const quizId1User2 = quizUser2CreateQuiz1Response.quizId;

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
    requestClear();

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
    requestClear();

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

    // Transfer user 2's quiz 1 to user 1: BUT
    // use Transferee's token,
    // ie Trasnferee is not an owner of this quiz, so can't transfer
    // Transferee's email address:
    const transfereeEmail = user2Email;
    // Trasnferor's token
    const transferorToken = tokenUser1;

    // execute transfer
    const responseTransfer = requestTransferQuestion(
      transferorToken,
      transfereeEmail,
      quizId1User2
    ) as TransferQuizServerReturn;

    const transferResponseTest = responseTransfer.bodyString;

    // Check for error object

    expect(transferResponseTest).toStrictEqual({ error: expect.any(String) });

    // check for status code 403

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_ERROR_403);
  });
});
