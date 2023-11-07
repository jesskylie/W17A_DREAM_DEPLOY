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
} from './library/route_testing_functions';
import {
  QuestionBody,
  TokenString,
  requestAdminQuizInfoReturn,
  requestCreateQuestionReturn,
} from './library/interfaces';
import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  RESPONSE_ERROR_403,
  RESPONSE_OK_200,
  THUMBNAIL_URL_PLACEHOLDER,
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

describe('test /v2/admin/auth/logout : Returns an error object -> EXPECT ERROR CODE 401', () => {
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

// Test suite for PUT /v2/admin/user/password - START

describe('Testing PUT /v2/admin/user/password', () => {
  test('Testing successful password change', () => {
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

    const result = requestUpdatePasswordV2(
      testRegisterFn.body.token,
      password,
      'abcde123456'
    );

    expect(result).toStrictEqual({});
  });

  test('Old password is not the correct old password - error code 400', () => {
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

    const newPassword = 'abcde1234565';
    const wrongOldPassword = 'hellothere12345';

    expect(() =>
      requestUpdatePasswordV2(
        testRegisterFn.body.token,
        wrongOldPassword,
        newPassword
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Old password and new password match exactly - error code 400', () => {
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

    const newPassword = 'abcde1234565';
    const wrongOldPassword = newPassword;

    expect(() =>
      requestUpdatePasswordV2(
        testRegisterFn.body.token,
        wrongOldPassword,
        newPassword
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('New password has already been used by this user - error code 400', () => {
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

    const newPassword1 = 'abcde1234565';
    const OldPassword1 = password;

    requestGetAdminUserDetailV2(testRegisterFn.body.token);

    // successfully change password once
    requestUpdatePasswordV2(
      testRegisterFn.body.token,
      OldPassword1,
      newPassword1
    );

    requestGetAdminUserDetailV2(testRegisterFn.body.token);

    // unsuccessfully change password as attempted new password has been used before

    const newPassword2 = password;
    const OldPassword2 = newPassword1;
    expect(() =>
      requestUpdatePasswordV2(
        testRegisterFn.body.token,
        OldPassword2,
        newPassword2
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('New password is less than 8 characters - with error code 400', () => {
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

    expect(() =>
      requestUpdatePasswordV2(testRegisterFn.body.token, passwordBase, 'a')
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('New password does not contain at least one number and one letter - with error code 400', () => {
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

    expect(() =>
      requestUpdatePasswordV2(
        testRegisterFn.body.token,
        'abcde4284',
        '12345678910'
      )
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Testing unsuccessful password change (invalid token) with error code 401', () => {
    expect(() =>
      requestUpdatePasswordV2('a', 'abcde4284', '12345678910')
    ).toThrow(HTTPError[RESPONSE_ERROR_401]);
  });
});

// Test suite for PUT /v2/admin/user/password - END

// Test suite for POST /v2/admin/quiz/:quizId/question - START

describe('Testing POST /v2/admin/quiz/{quizId}/question', () => {
  test('Testing successful creating a quiz question', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    // check quizId was returned

    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    const newQuestion = requestCreateQuestionV2(
      token,
      validQuestion,
      quizId
    ) as requestCreateQuestionReturn;

    expect(newQuestion).toStrictEqual({
      questionId: expect.any(Number),
    });
  });

  test('Testing QuizId does not refer to valid quiz - error code 403', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    requestAdminQuizCreateV2(token, 'New Quiz', 'Description of quiz');

    // create invalid quizIdcheck quizId was returned

    const quizId = -1;

    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    expect(() => requestCreateQuestionV2(token, validQuestion, quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_403]
    );
  });

  test('Question string is less than 5 characters - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    // check quizId was returned

    const shortQuizIdQuestion = {
      question: '?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    expect(() =>
      requestCreateQuestionV2(token, shortQuizIdQuestion, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Question string is more than 50 characters - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const longQuizIdQuestion = {
      question: '1234567891 1234567891 1234567891 1234567891 1234567891?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    expect(() =>
      requestCreateQuestionV2(token, longQuizIdQuestion, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Question duration is not a positive number - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const negativeLength = {
      question: 'What color is the sky?',
      duration: -1,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    expect(() =>
      requestCreateQuestionV2(token, negativeLength, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Question has less than 2 answers - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const oneAnswer = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
      ],
    } as QuestionBody;

    expect(() => requestCreateQuestionV2(token, oneAnswer, quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Question has more than 6 answers - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const tooManyAnswers = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 10,
      answers: [
        {
          answer: 'Blue',
          correct: true,
        },
        {
          answer: 'Yellow',
          correct: false,
        },
        {
          answer: 'Blue',
          correct: false,
        },
        {
          answer: 'Blue',
          correct: false,
        },
        {
          answer: 'Red',
          correct: false,
        },
        {
          answer: 'Green',
          correct: false,
        },
        {
          answer: 'Black',
          correct: false,
        },
      ],
    } as QuestionBody;

    expect(() =>
      requestCreateQuestionV2(token, tooManyAnswers, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Question duration exceeds 3 minutes - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const question1 = {
      question: 'What color is the sky?',
      duration: 90,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    requestCreateQuestionV2(token, question1, quizId);

    const question2 = {
      question: 'Who makes the 787 Dreamliner?',
      duration: 100,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 10,
      answers: [
        {
          answer: 'Boeing',
          correct: true,
        },
        {
          answer: 'Airbus',
          correct: false,
        },
      ],
    } as QuestionBody;

    expect(() => requestCreateQuestionV2(token, question2, quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('Question duration updated correctly - response true', () => {
    // STILL USING V1 requestAdminQuizInfo ROUTE TESTING
    // FUNCTION AS V2 HAS NOT YET BEEN IMPLEMENTED
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const duration1 = 3;
    const duration2 = 11;
    const question1 = {
      question: 'What color is the sky?',
      duration: duration1,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
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

    requestCreateQuestionV2(token, question1, quizId);

    const question2 = {
      question: 'Who makes the 787 Dreamliner?',
      duration: duration2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 10,
      answers: [
        {
          answer: 'Boeing',
          correct: true,
        },
        {
          answer: 'Airbus',
          correct: false,
        },
      ],
    } as QuestionBody;

    requestCreateQuestionV2(token, question2, quizId);

    // get information about quiz
    // /v2/admin/quiz/{quizid}

    // Test that the duration of the two questions equals
    // the total duration of the quiz

    const quizInfo = requestAdminQuizInfo(
      token,
      quizId
    ) as requestAdminQuizInfoReturn;

    if ('duration' in quizInfo.bodyString) {
      const testTotalDuration = quizInfo.bodyString.duration;
      expect(testTotalDuration).toStrictEqual(duration1 + duration2);
    }
  });

  test('Points awarded for question is not between 1 and 10 - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const lessThanOne = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 0,
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

    const moreThanTen = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 20,
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

    expect(() => requestCreateQuestionV2(token, lessThanOne, quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );

    expect(() => requestCreateQuestionV2(token, moreThanTen, quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );
  });

  test('The length of the answers must be between 1 and 30 characters - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const lessThanOne = {
      question: 'What color is the sky?',
      duration: 3,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 5,
      answers: [
        {
          answer: '',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;

    const moreThanThirty = {
      question: 'What color is the sky?',
      duration: 3,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 5,
      answers: [
        {
          answer:
            'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          correct: true,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;

    expect(() => requestCreateQuestionV2(token, lessThanOne, quizId)).toThrow(
      HTTPError[RESPONSE_ERROR_400]
    );

    expect(() =>
      requestCreateQuestionV2(token, moreThanThirty, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Answer strings are duplicates of one another - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const duplicateAnswers = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 5,
      answers: [
        {
          answer: 'Yellow',
          correct: true,
        },
        {
          answer: 'Yellow',
          correct: true,
        },
      ],
    } as QuestionBody;

    expect(() =>
      requestCreateQuestionV2(token, duplicateAnswers, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('There are no correct answers - error code 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    const incorrectAnswers = {
      question: 'What is 2 + 2?',
      duration: 3,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 4,
      answers: [
        {
          answer: 'Yellow',
          correct: false,
        },
        {
          answer: 'Green',
          correct: false,
        },
      ],
    } as QuestionBody;

    expect(() =>
      requestCreateQuestionV2(token, incorrectAnswers, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });

  test('Testing Token is empty or invalid - error code 401', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    // Incorrect - has to return 401
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 5,
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

    const newToken = '';

    expect(() =>
      requestCreateQuestionV2(newToken, validQuestion, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_401]);
  });

  test('Valid token is provided, but user is not an owner of this quiz - error code 403', () => {
    requestClear();
    // user1 created and user1's token creates quiz
    const user1 = requestAdminRegister(
      'abc@hotmail.com',
      'abcde4284',
      'Ann',
      'Pie'
    );
    const token = user1.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );
    // user2 created. user2 does not create a quiz
    const user2 = requestAdminRegister(
      'paul@gmail.com',
      'abcde4284',
      'Paul',
      'Rather'
    );
    const token2 = user2.body.token;

    const quizId = quizCreateResponse.quizId;

    // Incorrect - has to return 403
    const validQuestion = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: THUMBNAIL_URL_PLACEHOLDER,
      points: 5,
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

    // question is created on quizId of user1, but with user2's token

    expect(() =>
      requestCreateQuestionV2(token2, validQuestion, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_403]);
  });
});

describe('Testing POST /v2/admin/quiz/{quizId}/question - thumbnailUrl tests - EXPECT ERROR CODE 400', () => {
  test('The thumbnailUrl is an empty string - EXPECT ERROR CODE 400', () => {
    requestClear();
    const response = requestAdminRegister(
      emailBase,
      passwordBase,
      'Ann',
      'Pie'
    );
    const token = response.body.token;
    const quizCreateResponse = requestAdminQuizCreateV2(
      token,
      'New Quiz',
      'Description of quiz'
    );

    const quizId = quizCreateResponse.quizId;

    // check quizId was returned

    const invalidQuestionNoThumbnailUrl = {
      question: 'What color is the sky?',
      duration: 2,
      thumbnailUrl: '',
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

    expect(() =>
      requestCreateQuestionV2(token, invalidQuestionNoThumbnailUrl, quizId)
    ).toThrow(HTTPError[RESPONSE_ERROR_400]);
  });
});

// Test suite for POST /v2/admin/quiz/:quizId/question - END
