/*
###########################################################################################
ROUTES TESTED IN THIS FILE
PUT /v1/admin/quiz/:quizid/thumbnail -> adminQuizThumbnailUrlUpdate in src/quizV2.ts -> requestAdminUpdateQuizThumbnail
###########################################################################################
*/

import HTTPError from 'http-errors';
import {
  requestClear,
  requestAdminRegister,
  requestAdminQuizCreateV2,
  requestAdminUpdateQuizThumbnail,
  requestAdminQuizInfoV2,
} from './library/route_testing_functions';
import { TokenString, requestAdminQuizInfoReturn } from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  DEFAULT_VALID_THUMBNAIL_URL,
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

// functions used in this file - END

// interfaces used in this file - START

interface RequestAdminRegisterReturn {
  body: TokenString;
  status: number;
}

// interfaces used in this file - END

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

describe('test /v1/admin/quiz/{quizid}/thumbnail: Confirms thumbnailUrl has changed -> EXPECT 200 SUCCESS', () => {
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

    // check imageUrl has been updated for quiz
    // get info about quiz

    const testQuizInfo = requestAdminQuizInfoV2(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    const updatedQuizObject = testQuizInfo;

    if ('thumbnailUrl' in updatedQuizObject) {
      const updatedImgUrl = updatedQuizObject.thumbnailUrl;

      expect(updatedImgUrl).toStrictEqual(VALID_THUMBNAIL_URL);
    }
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

    // check imageUrl has NOT been updated for quiz
    // get info about quiz

    const testQuizInfo = requestAdminQuizInfoV2(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    const updatedQuizObject = testQuizInfo;

    if ('thumbnailUrl' in updatedQuizObject) {
      const updatedImgUrl = updatedQuizObject.thumbnailUrl;

      expect(updatedImgUrl).toStrictEqual(DEFAULT_VALID_THUMBNAIL_URL);
    }
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
      requestAdminUpdateQuizThumbnail(quizId + 1, token, VALID_THUMBNAIL_URL)
    ).toThrow(HTTPError[RESPONSE_ERROR_403]);

    // check imageUrl has NOT been updated for quiz
    // get info about quiz

    const testQuizInfo = requestAdminQuizInfoV2(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    const updatedQuizObject = testQuizInfo;

    if ('thumbnailUrl' in updatedQuizObject) {
      const updatedImgUrl = updatedQuizObject.thumbnailUrl;

      expect(updatedImgUrl).toStrictEqual(DEFAULT_VALID_THUMBNAIL_URL);
    }
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

    // check imageUrl has NOT been updated for quiz
    // get info about quiz

    const testQuizInfo = requestAdminQuizInfoV2(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    const updatedQuizObject = testQuizInfo;

    if ('thumbnailUrl' in updatedQuizObject) {
      const updatedImgUrl = updatedQuizObject.thumbnailUrl;

      expect(updatedImgUrl).toStrictEqual(DEFAULT_VALID_THUMBNAIL_URL);
    }
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

    // check imageUrl has NOT been updated for quiz
    // get info about quiz

    const testQuizInfo = requestAdminQuizInfoV2(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    const updatedQuizObject = testQuizInfo;

    if ('thumbnailUrl' in updatedQuizObject) {
      const updatedImgUrl = updatedQuizObject.thumbnailUrl;

      expect(updatedImgUrl).toStrictEqual(DEFAULT_VALID_THUMBNAIL_URL);
    }
  });
});
