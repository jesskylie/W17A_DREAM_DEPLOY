import HTTPError from 'http-errors';
import {
  requestClear,
  requestAdminRegister,
  requestAdminQuizInfo,
  requestAdminLogoutV2,
  requestAdminAuthLogin,
  requestGetAdminUserDetailV2,
  requestAdminUserDetailUpdateV2,
  requestUpdatePasswordV2,
  requestAdminQuizCreateV2,
  requestCreateQuestionV2,
  requestAdminQuizCreate,
  requestAdminQuizRemove,
  
  requestAdminQuizListV2,
  requestAdminTrashQuizRestoreV2,
  requestAdminTrashQuizEmptyV2,
  requestAdminTrashQuizListV2,
  requestTransferQuestionV2
} from './library/route_testing_functions';

import {
  QuestionBody,
  TokenString,
  requestAdminQuizInfoReturn,
  requestCreateQuestionReturn,
  CreateQuizQuestionReturn,
  
  TransferQuizServerReturn,
  requestAdminQuizListReturn,
  requestAdminTrashQuizRestoreReturn,
  requestAdminQuizRemoveReturn,
} from './library/interfaces';

import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  RESPONSE_OK_200,
  THUMBNAIL_URL_PLACEHOLDER,
} from './library/constants';

interface QuizId {
  quizId: number;
}

interface SmallQuizArray {
  quizId: number;
  name: string;
}

export interface CreateQuizQuestionServerReturn {
  bodyString: CreateQuizQuestionReturn;
  statusCode: number;
}

const emailBase = 'gulemail3@gmail.com';
const passwordBase = 'password123456789';
//********************************************************

//********************************************************
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
    const responseTransfer = requestTransferQuestionV2(
      transferorToken,
      transfereeEmail,
      quizId1User2
    );

    const transferResponseTest = responseTransfer;

    // Check for blank object

    expect(transferResponseTest).toStrictEqual({});

    // check for status code 200

    const transferStatusCodeTest = responseTransfer.statusCode;

    expect(transferStatusCodeTest).toStrictEqual(RESPONSE_OK_200);
    // ######
    // Test that quizIdUser2 now appears in quizzes owned by user 1
    // get list of all quizzes owned by user 1
    const user1Quizzes: requestAdminQuizListReturn =
      requestAdminQuizListV2(tokenUser1);

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
      requestAdminQuizListV2(tokenUser2);

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
    expect(() => requestTransferQuestionV2( transferorToken,
      transfereeEmail,
      quizId1User2)
  ).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    expect(() => requestTransferQuestionV2( transferorToken, transfereeEmail, quizId1User2)).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    expect(() => requestTransferQuestionV2(  transferorToken,
      transfereeEmail,
      quizId1User2)).toThrow(HTTPError[RESPONSE_ERROR_400]);
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

    expect(() => requestTransferQuestionV2(  transferorToken,
      transfereeEmail,
      quizId1User2)).toThrow(HTTPError[RESPONSE_ERROR_400]);
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
    let invalidToken = 'inergogne';

    expect(() => requestTransferQuestionV2( invalidToken,
      transfereeEmail,
      quizId1User2)).toThrow(HTTPError[RESPONSE_ERROR_401]);
    
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
    expect(() => requestTransferQuestionV2( transferorToken,
      transfereeEmail,
      quizId1User2)).toThrow(HTTPError[RESPONSE_ERROR_401]);
    
  });
});

//********************************************************adminQuizList

describe('adminQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'jack@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    
    const QuizPrint = requestAdminQuizListV2(testToken);
    expect(QuizPrint.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
        {
          quizId: QuizTwo.quizId,
          name: 'Quiz Two',
        },
      ],
    });
    expect(QuizPrint.statusCode).toStrictEqual(RESPONSE_OK_200);
  });
  test('Error 401: invalid token', () => {
    requestClear();
    expect(() => requestAdminLogoutV2('invalid')).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });
  test('Error 401: empty token', () => {
    requestClear();
    expect(() => requestAdminLogoutV2('')).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });
});

//******************************************************** adminTrashQuizRestore
describe('adminTrashQuizRestore testing', () => {
  test('StatusCode 200: Valid input', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, QuizOne.quizId);
    requestAdminQuizRemove(testToken, QuizTwo.quizId);
    requestAdminTrashQuizRestoreV2(testToken, QuizOne.quizId);
    const quizOneRestored = requestAdminQuizListV2(testToken);
    expect(quizOneRestored.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
      ],
    });
    requestAdminTrashQuizRestoreV2(testToken, QuizTwo.quizId);
    const quizTwoRestored = requestAdminQuizListV2(testToken);
    expect(quizTwoRestored.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
        {
          quizId: QuizTwo.quizId,
          name: 'Quiz Two',
        },
      ],
    });
  });

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;
    expect(() =>requestAdminTrashQuizRestoreV2(testToken, -1 * 1531)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Error 400: Quiz name of the restored quiz is already used by another active quiz', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;
    const quiz1 = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, quiz1.quizId);
    requestAdminQuizCreate(testToken, 'Quiz 1', 'this is my second quiz');
    expect(() =>requestAdminTrashQuizRestoreV2(testToken, quiz1.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Error 400: Quiz ID refers to a quiz that is not currently in the trash', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;
    const quiz1 = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    expect(() => requestAdminTrashQuizRestoreV2(testToken, quiz1.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz test 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    expect(() => requestAdminTrashQuizRestoreV2('',  Quiz.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz test 2',
      'this is my second quiz'
    ).bodyString as QuizId;
    expect(() => requestAdminTrashQuizRestoreV2('invalid', Quiz.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'alex1@hotmail.com',
      '123456ab',
      'Jack',
      'Harlow'
    );

    const testToken = returnTokenObj.body.token;

    requestAdminRegister('tony2@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin('tony2@hotmail.com', 'ab123456b')
      .bodyString as TokenString;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Tony2',
      'Tony quiz'
    ).bodyString as QuizId;
    // priority Error test: 403 > 400
    expect(() => requestAdminTrashQuizRestoreV2(testToken, TonyQuiz.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_403]
    );
    requestAdminQuizRemove(returnToken2.token, TonyQuiz.quizId);
    expect(() => requestAdminTrashQuizRestoreV2(testToken, TonyQuiz.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_403]
    );
  });
});
//******************************************************** adminTrashQuizEmpty
describe('adminTrashQuizEmpty testing', () => {
  test('StatusCode 200: Valid input', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    );

    const testToken = returnTokenObj.body.token;

    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;
    requestAdminQuizRemove(testToken, QuizOne.quizId);
    requestAdminQuizRemove(testToken, QuizTwo.quizId);
    const array = [QuizOne.quizId, QuizTwo.quizId];
    requestAdminTrashQuizEmptyV2(testToken, JSON.stringify(array));
    const quizOneRestoredfail = requestAdminTrashQuizRestoreV2(
      testToken,
      QuizOne.quizId
    );
    expect(quizOneRestoredfail.statusCode).toBe(RESPONSE_ERROR_400);
    expect(quizOneRestoredfail.bodyString).toStrictEqual({
      error: expect.any(String),
    });
    expect(() => requestAdminTrashQuizRestoreV2(testToken, QuizTwo.quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_403]
    );
  });
  

  test('Error 400: Quiz ID does not refer to a valid quiz', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    );

    const testToken = returnTokenObj.body.token;
    expect(() =>requestAdminTrashQuizEmptyV2(testToken, JSON.stringify([-1 * 1531]))).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Error 400: Quiz ID refers to a quiz that is not currently in the trash', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    );

    const testToken = returnTokenObj.body.token;
    const quiz1 = requestAdminQuizCreate(
      testToken,
      'Quiz 1',
      'this is my first quiz'
    ).bodyString as QuizId;
    expect(() =>requestAdminTrashQuizEmptyV2(testToken, JSON.stringify([quiz1.quizId]))).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Error 401: Token is empty', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    );

    const testToken = returnTokenObj.body.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz a',
      'this is my first quiz'
    ).bodyString as QuizId;
    expect(() =>requestAdminTrashQuizEmptyV2('', JSON.stringify([Quiz.quizId]))).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Error 401: Token is invalid', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    );

    const testToken = returnTokenObj.body.token;
    const Quiz = requestAdminQuizCreate(
      testToken,
      'Quiz b',
      'this is my second quiz'
    ).bodyString as QuizId;
      expect(() =>requestAdminTrashQuizEmptyV2('invalid',JSON.stringify([Quiz.quizId]))).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Error 403: Quiz ID does not refer to a quiz that this user owns', () => {
    requestClear();
    // create user
    const returnTokenObj = requestAdminRegister(
      'emma1@hotmail.com',
      '123456ab',
      'Emma',
      'Homes'
    );

    const testToken = returnTokenObj.body.token;
    requestAdminRegister('ricky1@hotmail.com', 'ab123456b', 'Tony', 'Stark');
    const returnToken2 = requestAdminAuthLogin(
      'ricky1@hotmail.com',
      'ab123456b'
    ).bodyString as TokenString;
    const TonyQuiz = requestAdminQuizCreate(
      returnToken2.token,
      'Jack',
      'Tony quiz'
    ).bodyString as QuizId;
    expect(
      requestAdminTrashQuizRestoreV2(testToken, TonyQuiz.quizId).statusCode
    ).toBe(RESPONSE_ERROR_403);
    requestAdminQuizRemove(returnToken2.token, TonyQuiz.quizId);
    expect(() =>requestAdminTrashQuizEmptyV2(testToken,
      JSON.stringify([TonyQuiz.quizId]))).toThrow(
      HTTPError[RESPONSE_ERROR_403]
    );
  });
});

//******************************************************** TrashQuizList

describe('adminTrashQuizList testing', () => {
  test('Status Code 200: valid input', () => {
    requestClear();
    // create user
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const testToken = response.body.token;
    

    // Create quiz 1
    const QuizOne = requestAdminQuizCreate(
      testToken,
      'Quiz One',
      'this is my first quiz'
    ).bodyString as QuizId;

    // create quiz 2
    const QuizTwo = requestAdminQuizCreate(
      testToken,
      'Quiz Two',
      'this is my second quiz'
    ).bodyString as QuizId;

    // should wait here
    // Send QuizOne to trash
    requestAdminQuizRemove(testToken, QuizOne.quizId);

    // print out quiz in trash
    const TrashQuizPrint = requestAdminTrashQuizListV2(testToken);

    expect(TrashQuizPrint.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
      ],
    });
    requestAdminQuizRemove(testToken, QuizTwo.quizId);
    const TrashQuizPrint2 = requestAdminTrashQuizListV2(testToken);
    expect(TrashQuizPrint2.bodyString).toStrictEqual({
      quizzes: [
        {
          quizId: QuizOne.quizId,
          name: 'Quiz One',
        },
        {
          quizId: QuizTwo.quizId,
          name: 'Quiz Two',
        },
      ],
    });
  });

  test('Error 401: invalid token', () => {
    expect(() => requestAdminTrashQuizListV2('invalid')).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });

  test('Error 401: empty token', () => {
    expect(() => requestAdminTrashQuizListV2('')).toThrow(
      HTTPError[RESPONSE_ERROR_403]
    );
  });
});
