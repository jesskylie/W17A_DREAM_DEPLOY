/*
###########################################################################################
ROUTES TESTED IN THIS FILE
POST /v2/admin/auth/logout -> adminAuthLogoutV2 -> requestAdminLogoutV2
GET /v2/admin/user/details -> adminUserDetailsV2 -> requestGetAdminUserDetailV2
PUT /v2/admin/user/details -> adminUserDetailUpdateV2 -> requestAdminUserDetailUpdateV2
PUT /v2/admin/user/password -> updatePasswordV2 -> requestUpdatePasswordV2
POST /v2/admin/quiz/:quizId/question -> createQuizQuestionV2 -> requestCreateQuestionV2
###########################################################################################
*/

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
  requestAdminUpdateQuizThumbnail,
} from './library/route_testing_functions';
import {
  QuestionBody,
  TokenString,
  requestAdminQuizInfoReturn,
  requestCreateQuestionReturn,
  ImageUrlReturn,
} from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  RESPONSE_OK_200,
  VALID_THUMBNAIL_URL,
  INVALID_THUMBNAIL_URL_NOT_A_FILE,
  INVALID_THUMBNAIL_URL_NOT_JPG_PNG,
} from './library/constants';

// --------------------------------------------------
// Test suite for POST /v2/admin/auth/logout route - START

// constants used in this file - START

const emailBase = 'paulemail3@gmail.com';
const passwordBase = 'password123456789';

// constants used in this file - END

// functions used in this file - START

interface UserObject {
  user: {
    authUserId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

function createUserObject(
  authUserId: number,
  name: string,
  email: string,
  numSuccessfulLogins: number,
  numFailedPasswordsSinceLastLogin: number
): UserObject {
  const expectedUserObject: UserObject = {
    user: {
      authUserId,
      name,
      email,
      numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin,
    },
  };

  return expectedUserObject;
}

// functions used in this file - END

// interfaces used in this file - START

interface RequestAdminRegisterReturn {
  body: TokenString;
  status: number;
}

// interfaces used in this file - END

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

describe('test /v1/admin/quiz/{quizid}/thumbnail: Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns imgUrl object object -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const testUpdateQuizThumbnail = requestAdminUpdateQuizThumbnail(
      quizId,
      token,
      VALID_THUMBNAIL_URL
    );

    expect(testUpdateQuizThumbnail).toStrictEqual({});
  });
});

describe('test /v1/admin/quiz/{quizid}/thumbnail: EXPECT ERROR 400 | 401 | 403', () => {
  test('Token is empty or invalid (does not refer to valid logged in user session) -> EXPECT ERROR CODE 401', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    expect(() =>
      requestAdminUpdateQuizThumbnail(quizId, '', VALID_THUMBNAIL_URL)
    ).toThrow(HTTPError[RESPONSE_ERROR_401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz -> EXPECT ERROR CODE 403', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    expect(() =>
      requestAdminUpdateQuizThumbnail(quizId + 1, '', VALID_THUMBNAIL_URL)
    ).toThrow(HTTPError[RESPONSE_ERROR_403]);
  });

  test('imgUrl when fetched does not return a valid file -> EXPECT ERROR CODE 400', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    expect(() =>
      requestAdminUpdateQuizThumbnail(
        quizId,
        token,
        INVALID_THUMBNAIL_URL_NOT_A_FILE
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('imgUrl when fetch is not a JPG or PNG image -> EXPECT ERROR CODE 400', () => {
    requestClear();
    // Create user
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegister = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    const token = testRegister.body.token;

    // Create quiz
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    expect(() =>
      requestAdminUpdateQuizThumbnail(
        quizId,
        token,
        INVALID_THUMBNAIL_URL_NOT_JPG_PNG
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });
});
