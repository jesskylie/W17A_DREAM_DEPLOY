import HTTPError from 'http-errors';
import {
  // requestAdminQuizCreate,
  // requestAdminQuizInfo,
  // requestAdminQuizQuestionMove,
  requestClear,
  requestAdminRegister,
  requestAdminLogoutV2,
  requestAdminAuthLogin,
  requestGetAdminUserDetailV2,
  requestAdminUserDetailUpdateV2,
  // requestCreateQuestion,
  // requestDeleteQuizQuestion,
  // requestDuplicateQuestion,
  // requestUpdateQuestion,
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

interface RequestAdminLoginReturn {
  bodyString: TokenString;
  status: number;
}

// interfaces used in this file - END

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

describe('test /v2/admin/auth/logout : Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
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

    // logout user
    // expect empty object and status code 200

    const token = testRegister.body.token;

    const testLogout = requestAdminLogoutV2(token);

    const statusCode = testRegister.status;

    expect(testLogout).toStrictEqual({});

    expect(statusCode).toStrictEqual(RESPONSE_OK_200);
  });
});

describe('test /v1/admin/auth/logout : Returns an error object -> EXPECT ERROR CODE 401', () => {
  test('Returns error object -> EXPECT ERROR CODE 401', () => {
    requestClear();

    // logout user with invalid token
    const token = '';

    expect(() => requestAdminLogoutV2(token)).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });
});

// Test suite for POST /v2/admin/auth/logout  - END

// Test suite for GET /v2/admin/user/details - START

describe('test get /v2/admin/user/details : Returns a user details object -> EXPECT 200 SUCCESS', () => {
  test('Returns user details object -> EXPECT SUCESS CODE 200', () => {
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

    // use token to get adminUserDetails

    const adminUserDetailsTest = requestGetAdminUserDetailV2(token);

    const expectedUserObject = createUserObject(
      0,
      `${nameFirst} ${nameLast}`,
      email,
      1,
      0
    );

    expect(adminUserDetailsTest).toStrictEqual(expectedUserObject);
  });
});

describe('test get /v2/admin/user/details : Returns a user details multiple logins object', () => {
  test('Returns user details object wiht multiple logins', () => {
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

    // use token to get adminUserDetails

    const adminUserDetailsTest = requestGetAdminUserDetailV2(token);

    const expectedUserObjectFirstLogin = createUserObject(
      0,
      `${nameFirst} ${nameLast}`,
      email,
      1,
      0
    );

    // Initial login will be successful and have:
    // 0 numFailedPasswordsSinceLastLogin
    // 1 numSuccessfulLogins
    expect(adminUserDetailsTest).toStrictEqual(expectedUserObjectFirstLogin);

    // logout user successfully

    const testLogout = requestAdminLogoutV2(token);

    const statusCode = testRegister.status;

    expect(testLogout).toStrictEqual({});

    expect(statusCode).toStrictEqual(RESPONSE_OK_200);

    // unsuccessful login
    requestAdminAuthLogin(email, '');

    const successfulLoginTest = requestAdminAuthLogin(
      email,
      password
    ) as RequestAdminLoginReturn;

    const successToken = successfulLoginTest.bodyString.token;

    // get user details:
    const adminUserDetailsFailedLoginTest =
      requestGetAdminUserDetailV2(successToken);

    const expectedUserObjectSecondLogin = createUserObject(
      0,
      `${nameFirst} ${nameLast}`,
      email,
      2,
      0
    );

    expect(adminUserDetailsFailedLoginTest).toStrictEqual(
      expectedUserObjectSecondLogin
    );
  });
});

describe('test get /v2/admin/user/details : Returns error -> EXPECT 401 ERROR', () => {
  test('Returns ERROR -> EXPECT ERROR 401 - Token is empty or invalid (does not refer to valid logged in user session)', () => {
    requestClear();

    const token = '';

    // use token to get adminUserDetails

    expect(() => requestGetAdminUserDetailV2(token)).toThrow(
      HTTPError[RESPONSE_ERROR_401]
    );
  });
});

// Test suite for GET /v2/admin/user/details - END

// Test suite for PUT /v2/admin/user/details - START

describe('test adminUserDetailUpdate function : Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
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

    // Update user details
    const newEmail = 'peter@gmail.com';
    const newNameFirst = 'Peter';
    const newNameLast = 'Archibald';

    const token = testRegister.body.token;
    const testadminUserDetailUpdateFn = requestAdminUserDetailUpdateV2(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    console.log('testadminUserDetailUpdateFn ->', testadminUserDetailUpdateFn);

    // test for returned empty object
    expect(testadminUserDetailUpdateFn).toStrictEqual({});
  });
});

// Function test 2 - name & email ERROR - adminUserDetailUpdate
describe('test adminUserDetailUpdate function : ERRORS WITH NAMES AND EMAIL -> EXPECT ERROR STRING', () => {
  test('Returns error object due email used by existing user -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // await new Promise((res) => setTimeout(res, WAIT_TIME));

    // create user 2 - completely different
    const email2 = 'peteremail3@gmail.com';
    const password2 = 'password123456789';
    const nameFirst2 = 'Peter';
    const nameLast2 = 'Archibald';

    requestAdminRegister(email2, password2, nameFirst2, nameLast2);

    // Update user 1 with same email as user 2

    // Update user details, but use incorrect user's token
    const newEmail = 'peteremail3@gmail.com';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, nameFirst, nameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 3 - email does not conform with NPM email validator package
  test('Returns error object due email not satisfying NPM Email Validator -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail';
    const newNameFirst = 'Paul';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 4 - nameFirst contains characters other than lowercase, uppercase, spaces, hyphens, or apostrophes
  test('Returns error object due NameFirst not satisfying character requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = '$Paul!!';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 5 - nameFirst must be greater than 1 character
  test('Returns error object due NameFirst not satisfying minimum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'P';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 6 - nameFirst must be no greater than 20 characters
  test('Returns error object due NameFirst not satisfying maximum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst =
      'Ppppppppppppppppaaaaaaaaaaaaaaaaauuuuuuuuuuuuuuuuuuuuuuulllllllllllllllllll';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 7 - nameLast contains characters other than lowercase, uppercase, spaces, hyphens, or apostrophes
  test('Returns error object due NameLast not satisfying character requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast = '!!Reyno^^lds***';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 8 - nameLast must be greater than 1 character
  test('Returns error object due NameLast not satisfying minimum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast = 'R';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 9 - nameLast must be no greater than 20 characters
  test('Returns error object due NameLast not satisfying maximum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = emailBase;
    const password = passwordBase;
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as RequestAdminRegisterReturn;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast =
      'Rrrrrrrrrrrrreeeeeeeeeeeeeeeeeyyyyyyyyyyyyyyynnnnnnnnnnnnnnnoooooooooooolllllllllllddddddddddddsssssssssssss';

    const token = testRegisterFn.body.token;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  // Function test 10 - token is empty or invalid (does not refer to valid logged in user session)
  test('Returns error object due token is empty or invalid -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast = 'Reynolds';

    let token: any;

    expect(() =>
      requestAdminUserDetailUpdateV2(token, newEmail, newNameFirst, newNameLast)
    ).toThrow(HTTPError[RESPONSE_ERROR_401]);
  });
});

// Test suite for PUT /v2/admin/user/details - END
