// Do not delete this file _
import request from 'sync-request-curl';
import config from './config.json';

import {
  RESPONSE_OK_200,
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  WAIT_TIME,
} from './library/constants';

import { TokenString } from './library/interfaces';

import {
  adminAuthRegister,
  adminUserDetails,
  adminAuthLogout,
  UserInfo,
  adminUserDetailUpdate,
} from './auth';

// interfaces used throughout file - START

interface ErrorObject {
  error: string;
}

export interface ErrorObjectWithCode {
  error: string;
  errorCode: number;
}

interface RequestGenericReturn {
  statusCode: number;
  bodyString: ErrorObject | Record<string, never>;
}

interface AdminUserDetailUpdateReturn {
  detailsUpdateResponse: Record<string, never> | ErrorObjectWithCode;
}

interface RequestAdminDetailsUpdateServerReturn {
  bodyString: AdminUserDetailUpdateReturn;
  statusCode: number;
}

interface RequestUserDetailsReturn {
  bodyString: UserInfo | ErrorObject;
  statusCode: number;
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

function requestAdminLogout(token: string): RequestGenericReturn {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/logout', {
    json: {
      token,
    },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return { bodyString, statusCode };
}

function requestAdminUserDetailUpdate(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): RequestAdminDetailsUpdateServerReturn {
  const res = request('PUT', SERVER_URL + '/v1/admin/user/details', {
    json: {
      token,
      email,
      nameFirst,
      nameLast,
    },
  });
  const bodyString = JSON.parse(res.body.toString());
  const statusCode = res.statusCode;

  return { bodyString, statusCode };
}

function requestGetAdminUserDetail(token: string): RequestUserDetailsReturn {
  const res = request('GET', SERVER_URL + '/v1/admin/user/details', {
    qs: {
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

      const testLogout = requestAdminLogout(token) as RequestGenericReturn;

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
    const token = '';

    const testLogout = requestAdminLogout(token) as RequestGenericReturn;

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
// Update the details of an admin user (non-password)
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
      user: {
        authUserId: 0,
        name: nameFirst.concat(' ', nameLast),
        email: email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
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

// --------------------------------------------------
// Test suite for PUT /v1/admin/user/details route adminUserDetailUpdate() - START
// from swagger.yaml
// Update the details of an admin user (non-password)

// Route test 1 - OK - adminUserDetailUpdate
describe('test /v1/admin/user/details : Returns an empty object -> EXPECT 200 SUCCESS', () => {
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

    const tokenTest = testRegisterRt.token;

    const newEmail = 'peter@gmail.com';
    const newNameFirst = 'Peter';
    const newNameLast = 'Archibald';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      newEmail,
      newNameFirst,
      newNameLast
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for empty object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testEmptyObj = testObject.detailsUpdateResponse;
        expect(testEmptyObj).toStrictEqual({});
      }
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;

      expect(testStatusCode).toStrictEqual(RESPONSE_OK_200);
    } else {
      // throw an error if detailsUpdateResponse not in testAdminUserDetailUpdateRt
      expect(true).toStrictEqual(false);
    }

    // now check that original user details no longer exist
    const testUserDetails = requestGetAdminUserDetail(
      tokenTest
    ) as RequestUserDetailsReturn;

    const oldUserDetailObj = {
      user: {
        authUserId: 0,
        name: nameFirst.concat(' ', nameLast),
        email: email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      },
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

    if ('bodyString' in testUserDetails) {
      const testBodyString = testUserDetails.bodyString;
      if ('user' in testBodyString) {
        const user = { user: testBodyString.user };
        expect(user).toStrictEqual(newUserDetailObj);
        expect(user).not.toStrictEqual(oldUserDetailObj);
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }
  });
});

// Route tests ERROR - EMAIL AND NAMES INVALID
describe('test /v1/admin/user/details : Returns an error object -> EXPECT 400 SUCCESS', () => {
  // invalid name / email test 2
  test('Returns error object email used by another user -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // Create user secondary
    const email2 = 'peter@gmail.com';
    const password2 = 'password123456789';
    const nameFirst2 = 'Peter';
    const nameLast2 = 'Archibald';

    requestAdminRegister(
      email2,
      password2,
      nameFirst2,
      nameLast2
    ) as TokenString;

    // update user main's details with user secondary's email

    const tokenTest = testRegisterRt.token;

    const newEmail = 'peter@gmail.com';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      newEmail,
      nameFirst,
      nameLast
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 3
  test('Returns error object email not valid -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newEmail = 'peter@gmail';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      newEmail,
      nameFirst,
      nameLast
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 4
  test('Returns error object nameFirst not valid character requirements not satisified -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newNameFirst = '!Paul*';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      newNameFirst,
      nameLast
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 5
  test('Returns error object nameFirst not valid less than 2 characters -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newNameFirst = 'P';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      newNameFirst,
      nameLast
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 6
  test('Returns error object nameFirst not valid more than 20 characters -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newNameFirst =
      'Pppppppaaaaaaaaaaaaaaaauuuuuuuuuuuuuuuuuuuuullllllllllllllllllllllll';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      newNameFirst,
      nameLast
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 7
  test('Returns error object nameLast not valid character requirements not satisifed -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newLastFirst = '!!Re#ynolds)';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      nameFirst,
      newLastFirst
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 8
  test('Returns error object nameLast not valid less than 2 characters -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newLastFirst = 'R';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      nameFirst,
      newLastFirst
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid name / email test 9
  test('Returns error object nameLast not valid more than 20 characters -> EXPECT ERROR CODE 400', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    const tokenTest = testRegisterRt.token;

    const newLastFirst =
      'Rrrrrrrrrreeeeeeeeeeeeyyyyyyyyyyyynnnnnnnnnnnnooooooooooollllllllllllddddddddddssss';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      nameFirst,
      newLastFirst
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_400);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
  // invalid toekn test 10
  test('Returns error object token is empty or invalid -> EXPECT ERROR CODE 401', () => {
    requestClear();

    // Create user main
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

    // update user main's details with invalid email

    let tokenTest;

    const newLastFirst = 'Archibald';

    const testAdminUserDetailUpdateRt = requestAdminUserDetailUpdate(
      tokenTest,
      email,
      nameFirst,
      newLastFirst
    ) as RequestAdminDetailsUpdateServerReturn;

    // test for error object
    if ('bodyString' in testAdminUserDetailUpdateRt) {
      const testObject = testAdminUserDetailUpdateRt.bodyString;
      if ('detailsUpdateResponse' in testObject) {
        const testObj2 = testObject.detailsUpdateResponse;
        if ('error' in testObj2) {
          const testErrorObj = { error: testObj2.error };
          expect(testErrorObj).toStrictEqual({ error: expect.any(String) });
        }
      } else {
        expect(true).toStrictEqual(false);
      }
    } else {
      expect(true).toStrictEqual(false);
    }

    if ('statusCode' in testAdminUserDetailUpdateRt) {
      const testStatusCode = testAdminUserDetailUpdateRt.statusCode;
      expect(testStatusCode).toStrictEqual(RESPONSE_ERROR_401);
    } else {
      expect(true).toStrictEqual(false);
    }
  });
});

// Test suite for PUT /v1/admin/user/details route adminUserDetailUpdate() - END
