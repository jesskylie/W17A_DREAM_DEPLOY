// Do not delete this file _
import request from 'sync-request-curl';
import config from './config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_401,
  WAIT_TIME,
} from './library/constants';

import {
  adminAuthRegister,
  adminUserDetails,
  adminAuthLogout,
  UserInfo,
  adminUserDetailUpdate,
} from './auth';
import { Token } from 'yaml/dist/parse/cst';

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

interface RequestAdminLogoutReturn {
  statusCode: number;
  bodyString: ErrorObject | Record<string, never>;
}

interface TokenString {
  token: string;
}

// interfaces used throughout file - END

// constants used throughout file - START

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

// constants used throughout file - END

// Functions to call routes used within this file - START

function requestAdminRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): TokenString {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: {
      email: email,
      password: password,
      nameFirst: nameFirst,
      nameLast: nameLast,
    },
  });
  return JSON.parse(res.body.toString());
}

function requestAdminLogout(token: string): RequestAdminLogoutReturn {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
    json: {
      token,
    },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return { bodyString, statusCode };
}

const requestClear = () => {
  const res = request('DELETE', SERVER_URL + `/v1/clear`, {
    timeout: WAIT_TIME,
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;
  return { statusCode, bodyString };
};

// Functions to call routes used within this file - END

// --------------------------------------------------
// Test suite for adminLogout function - START

describe('test adminLogout : Returns an empty object -> EXPECT SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // logout user

    if ('token' in testRegisterFn) {
      const token = testRegisterFn.token;
      const testLogoutFn = adminAuthLogout(token) as
        | Record<string, never>
        | ErrorObject;

      // test for returned empty object
      expect(testLogoutFn).toStrictEqual({});

      // test for invalid token (token does not exist now)

      const testForNoUserDetails = adminUserDetails(token) as
        | UserInfo
        | ErrorObject;

      if ('error' in testForNoUserDetails) {
        const errorObject = testForNoUserDetails;
        // test for error object
        expect(errorObject).toStrictEqual({ error: expect.any(String) });
      } else {
        // if 'error' not in testForNoUserDetails deliberately throw error
        expect(true).toStrictEqual(false);
      }
    } else {
      // if 'token' not in testRegisterFn deliberately throw error
      expect(true).toStrictEqual(false);
    }
  });
});

describe('test adminLogout : Token is invalid or empty -> EXPECT ERROR', () => {
  test('Returns error object -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // logout user
    const token = '';

    const testLogoutFn = adminAuthLogout(token) as
      | Record<string, never>
      | ErrorObject;

    if ('error' in testLogoutFn) {
      const errorObj = testLogoutFn;

      // test for error object
      expect(errorObj).toStrictEqual({ error: expect.any(String) });
    } else {
      // if 'error' not in testLogoutFn deliberately throw error
      expect(true).toStrictEqual(false);
    }
  });
});

// Test suite for adminLogout function - END

// --------------------------------------------------
// Test suite for /v1/admin/auth/logout route - START

// From swagger.yaml:
// Should be called with a token that is returned after either a login or register has been made.

describe('test /v1/admin/auth/logout : Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
    requestClear();
    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterRt = requestAdminRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // logout user
    if ('token' in testRegisterRt) {
      const token = testRegisterRt.token;

      const testLogout = requestAdminLogout(token) as RequestAdminLogoutReturn;

      // test for returned empty object
      if ('bodyString' in testLogout) {
        expect(testLogout.bodyString).toStrictEqual({});
      } else {
        // if 'bodyString' not in testLogout deliberately throw error
        expect(true).toStrictEqual(false);
      }

      if ('statusCode' in testLogout) {
        const statusCode = testLogout.statusCode;
        expect(statusCode).toStrictEqual(RESPONSE_OK_200);
      } else {
        // if 'statusCode' not in testLogout deliberately throw error
        expect(true).toStrictEqual(false);
      }
    } else {
      // if 'token' not in testRegisterRt deliberately throw error
      expect(true).toStrictEqual(false);
    }
  });
});

describe('test /v1/admin/auth/logout : Returns an error object -> EXPECT ERROR CODE 401', () => {
  test('Returns error object -> EXPECT ERROR CODE 401', () => {
    requestClear();

    // logout user
    // logout user
    const token = '';

    const testLogout = requestAdminLogout(token) as RequestAdminLogoutReturn;

    // test for returned empty object
    if ('bodyString' in testLogout) {
      if ('error' in testLogout.bodyString) {
        expect(testLogout.bodyString).toStrictEqual({
          error: expect.any(String),
        });
      } else {
        // if 'error' not in testLogout.bodyString deliberately throw error
        expect(true).toStrictEqual(false);
      }
    } else {
      // if 'bodyString' not in testLogout deliberately throw error
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testLogout) {
      const statusCode = testLogout.statusCode;
      expect(statusCode).toStrictEqual(RESPONSE_ERROR_401);
    } else {
      // if 'statusCode' not in testLogout deliberately throw error
      expect(true).toStrictEqual(false);
    }
  });
});

// Test suite for /v1/admin/auth/logout route adminQuizCreate() - END

// --------------------------------------------------
// Test suite for adminUserDetailUpdate function - START
// from swagger.yaml
// Updat the details of an admin user (non-password)
// Function test 1 - OK - adminUserDetailUpdate

describe('test adminUserDetailUpdate function : Returns an empty object -> EXPECT 200 SUCCESS', () => {
  test('Returns empty object -> EXPECT SUCESS CODE 200', () => {
    requestClear();

    // Create user
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'peter@gmail.com';
    const newNameFirst = 'Peter';
    const newNameLast = 'Archibald';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for returned empty object
    expect(testadminUserDetailUpdateFn.detailsUpdateResponse).toStrictEqual({});

    // test for invalid token (token does not exist now)

    const testForNoUserDetails = adminUserDetails(token) as
      | UserInfo
      | ErrorObject;

    const oldUserDetailObj = {
      user: [
        {
          authUserId: 0,
          name: nameFirst.concat(' ', nameLast),
          email: email,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        },
      ],
    };

    const newUserDetailObj = {
      user: {
        authUserId: 0,
        name: newNameFirst.concat(' ', newNameLast),
        email: newEmail,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
    };

    if ('user' in testForNoUserDetails) {
      // test for error object
      expect(testForNoUserDetails).toStrictEqual(newUserDetailObj);
      expect(testForNoUserDetails).not.toStrictEqual(oldUserDetailObj);
    } else {
      // if 'error' not in testForNoUserDetails deliberately throw error
      expect(true).toStrictEqual(false);
    }
  });
});

// Function test 2 - name & email ERROR - adminUserDetailUpdate
describe('test adminUserDetailUpdate function : ERRORS WITH NAMES AND EMAIL -> EXPECT ERROR STRING', () => {
  test('Returns error object due email used by existing user -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // await new Promise((res) => setTimeout(res, WAIT_TIME));

    // create user 2 - completely different
    const email2 = 'peteremail3@gmail.com';
    const password2 = 'password123456789';
    const nameFirst2 = 'Peter';
    const nameLast2 = 'Archibald';

    adminAuthRegister(email2, password2, nameFirst2, nameLast2);

    // Update user 1 with same email as user 2

    // Update user details
    const newEmail = 'peteremail3@gmail.com';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      nameFirst,
      nameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject = { error: testErrorObject.error };
        expect(errorObject).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 3 - email does not conform with NPM email validator package
  test('Returns error object due email not satisfying NPM Email Validator -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail';
    const newNameFirst = 'Paul';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object
    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 4 - nameFirst contains characters other than lowercase, uppercase, spaces, hyphens, or apostrophes
  test('Returns error object due NameFirst not satisfying character requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = '$Paul!!';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 5 - nameFirst must be greater than 1 character
  test('Returns error object due NameFirst not satisfying minimum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'P';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 6 - nameFirst must be no greater than 20 characters
  test('Returns error object due NameFirst not satisfying maximum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst =
      'Ppppppppppppppppaaaaaaaaaaaaaaaaauuuuuuuuuuuuuuuuuuuuuuulllllllllllllllllll';
    const newNameLast = 'Reynolds';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 7 - nameLast contains characters other than lowercase, uppercase, spaces, hyphens, or apostrophes
  test('Returns error object due NameLast not satisfying character requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast = '!!Reyno^^lds***';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 8 - nameLast must be greater than 1 character
  test('Returns error object due NameLast not satisfying minimum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast = 'R';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });

  // Function test 9 - nameLast must be no greater than 20 characters
  test('Returns error object due NameLast not satisfying maximum length requirements -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Create user 1
    const email = 'paulemail3@gmail.com';
    const password = 'password123456789';
    const nameFirst = 'Paul';
    const nameLast = 'Reynolds';

    const testRegisterFn = adminAuthRegister(
      email,
      password,
      nameFirst,
      nameLast
    ) as TokenString;

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast =
      'Rrrrrrrrrrrrreeeeeeeeeeeeeeeeeyyyyyyyyyyyyyyynnnnnnnnnnnnnnnoooooooooooolllllllllllddddddddddddsssssssssssss';

    const token = testRegisterFn.token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });
  // Function test 10 - token is empty or invalid (does not refer to valid logged in user session)
  test('Returns error object due token is empty or invalid -> EXPECT ERROR OBJECT', () => {
    requestClear();

    // Update user details
    const newEmail = 'paulnewemail@gmail.com';
    const newNameFirst = 'Paul';
    const newNameLast = 'Reynolds';

    let token;
    const testadminUserDetailUpdateFn = adminUserDetailUpdate(
      token,
      newEmail,
      newNameFirst,
      newNameLast
    );

    // test for error object

    if ('detailsUpdateResponse' in testadminUserDetailUpdateFn) {
      const testErrorObject = testadminUserDetailUpdateFn.detailsUpdateResponse;
      if ('error' in testErrorObject) {
        const errorObject2 = { error: testErrorObject.error };
        expect(errorObject2).toStrictEqual({ error: expect.any(String) });
      } else {
        // throw an error
        expect(true).toStrictEqual(false);
      }
    } else {
      // throw an error
      expect(true).toStrictEqual(false);
    }
  });
});

// Test suite for adminUserDetailUpdate function - END
