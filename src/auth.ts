import { DataStore } from './dataStore';
import isEmail from 'validator/lib/isEmail.js';
import {
  retrieveDataFromFile,
  saveDataInFile,
  isTokenValid,
  getAuthUserIdUsingToken,
} from './functions';
import { uid } from 'uid';
import { ErrorObjectWithCode } from './quiz';

import {
  RESPONSE_ERROR_400,
  RESPONSE_ERROR_401,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from './library/constants';

// TypeScript interfaces - START
interface TokenString {
  token: string;
}

interface ErrorObject {
  error: string;
}

export interface UserInfo {
  user: {
    authUserId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  };
}

interface UserData {
  authUserId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  oldPasswords: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  quizId: number[];
  token: string[];
}

interface AdminUserDetailUpdateReturn {
  detailsUpdateResponse: Record<string, never> | ErrorObjectWithCode;
}

// TypeScript interfaces - END

/**
 * Returns details about the user, given their authUserId
 * Successful login starts at 1 at user registration
 * Number of failed logins is reset every time they have a successful login
 *
 * @param {string} - token- users authUserId
 * @returns {{user: {userId: number, name: string, email: string, numSuccessfulLogins: number
 *            numFailedPasswordsSinceLastLogin: number}}} - user details
 * @returns {{error: string}} - on error
 */
export function adminUserDetails(token: string): UserInfo | ErrorObject {
  const data: DataStore = retrieveDataFromFile();
  for (const user of data.users) {
    if (user.token.includes(token)) {
      return {
        user: {
          authUserId: user.authUserId,
          name: user.nameFirst + ' ' + user.nameLast,
          email: user.email,
          numSuccessfulLogins: user.numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin:
            user.numFailedPasswordsSinceLastLogin,
        },
      };
    }
  }
  saveDataInFile(data);
  return { error: 'Invalid Token' };
}

/**
 * Registers a user with their email, password, name and returns their authUserId value
 * Returns an error if email is invalid/is already in use, name/password does not satisfy criteria
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast- user's last name
 * @returns {{token: string}} - unique identifier for a user
 * @returns {{error: string}} - on error
 */

export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): TokenString | ErrorObject {
  // const data = getData();

  // Iteration 2: New data retrieval system - START
  const data: DataStore = retrieveDataFromFile();
  // Iteration 2: New data retrieval system - END

  // email address is already in use
  if (data.users.length >= 1) {
    for (const pass of data.users) {
      if (pass.email === email) {
        return { error: 'Email is already in use' };
      }
    }
  }

  if (!isEmail(email)) {
    return { error: 'Invalid email address' };
  }

  if (!isValidName(nameFirst) || !isValidName(nameLast)) {
    return { error: 'Invalid first name or last name' };
  }

  if (!isValidPassword(password)) {
    return { error: 'Invalid password' };
  }

  const newUser: UserData = {
    authUserId: data.users.length,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    oldPasswords: [],
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
    quizId: [],
    token: [],
  };
  data.users.push(newUser);
  const tokenString = uid();
  newUser.token.push(tokenString);

  // Iteration 2: New data save system - START
  saveDataInFile(data);
  // Iteration 2: New data save system - END

  // setData(data);

  return { token: tokenString };
}

/**
 * Returns a users authUserId, given a registered user's email and password
 * Returns an error if email is invalid/is already in use, name/password does not satisfy criteria
 * Updates successful/unsuccessful logins with each admin login call
 *
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @returns {{authUserId: number}} - unique identifier for a user
 * @returns {{error: string}} - on error
 */
export function adminAuthLogin(
  email: string,
  password: string
): TokenString | ErrorObject {
  // implemented by Paul 29Sep23
  // const data = getData();

  // Iteration 2: New data retrieval system - START
  const data: DataStore = retrieveDataFromFile();
  // Iteration 2: New data retrieval system - END

  // test for email exists
  let emailExistsBool = false;
  for (const arr of data.users) {
    if (arr.email === email) {
      emailExistsBool = true;
    }
  }

  if (!emailExistsBool) {
    return { error: 'Email address does not exist' };
  }

  // test for correct password
  let passwordIsCorrectBool = false;
  for (const arr of data.users) {
    if (arr.password === password) {
      passwordIsCorrectBool = true;
    }
  }

  // increments failed login attempts
  if (!passwordIsCorrectBool) {
    for (const arr of data.users) {
      if (arr.email === email && arr.password !== password) {
        arr.numFailedPasswordsSinceLastLogin++;
        return { error: 'Password is not correct for the given email' };
      }
    }
  }

  // return authUserId of logged in user
  // as email exists && password matches
  // increments successful login, numFailed login resets to 0
  let token;
  for (const arr of data.users) {
    if (arr.email === email && arr.password === password) {
      token = arr.token[0];
      arr.numSuccessfulLogins++;
      arr.numFailedPasswordsSinceLastLogin = 0;
    }
  }

  // Iteration 2: New data save system - START
  saveDataInFile(data);
  // Iteration 2: New data save system - END

  // setData(data);

  return {
    token: token,
  };
}

/**
 * Given details relating to a password change, update the password of a logged in user
 * Returns an error if old password is not correct old password, new password cannot be the same
 * as old password, new password has already been used before, new password is less than 8 chars
 * Updates successful/unsuccessful logins with each admin login call
 * @param {string} token - user's current sessionId
 * @param {string} password - user's new password
 * @returns {void} - returns {} on successful password change
 * @returns {{error: string}} - on error
 */

export function updatePassword(
  token: string,
  oldPassword: string,
  newPassword: string
): Record<string, never> | ErrorObjectWithCode {
  const data: DataStore = retrieveDataFromFile();
  // token is empty/invalid - return 401 error
  if (!isTokenValid(data, token)) {
    return {
      error: 'Token is empty or invalid',
      errorCode: RESPONSE_ERROR_401,
    };
  }

  // new password must be more than 8 characters, and have letters and numbers
  if (!isValidPassword(newPassword)) {
    return { error: 'Invalid password', errorCode: RESPONSE_ERROR_400 };
  }

  // loop through datastore to find the token
  for (const user of data.users) {
    if (user.token.includes(token)) {
      // token is found
      if (newPassword === user.password) {
        // check if new password is equal to old password
        // check if it exists in old passwords array
        return {
          error: 'New password can not be the same as old password',
          errorCode: RESPONSE_ERROR_400,
        };
      } else if (oldPassword !== user.password) {
        // old password does not match old password
        return {
          error: 'Old password does not match old password',
          errorCode: RESPONSE_ERROR_400,
        };
      } else if (user.oldPasswords.includes(newPassword)) {
        // check if old password exists in old password array
        return {
          error: 'New password has already been used by this user',
          errorCode: RESPONSE_ERROR_400,
        };
      } else {
        // move current password to old passwords array
        // update new password
        user.oldPasswords.push(oldPassword);
        user.password = newPassword;
        saveDataInFile(data);
        return {};
      }
    }
  }
  return { error: 'Token is empty or invalid', errorCode: RESPONSE_ERROR_401 };
}

// Iteration 2 functions

/**
 * Log outs an admin user who has an active session
 * Returns an empty object if successful and removes token from token array in Users: []
 * Returns an error if token is empty or invalid (does not refer to valid logged in user session)
 * @param {string} token - user's current sessionId
 *
 * @returns {void} - returns {} on successful password change
 * @returns {{error: string}} - on error
 */
function adminAuthLogout(token: string): Record<string, never> | ErrorObject {
  // retrieveDataFromFile, saveDataInFile

  const data: DataStore = retrieveDataFromFile();

  // test if token is valid; if not, return error
  const isTokenValidTest = isTokenValid(data, token);

  if (!isTokenValidTest) {
    return {
      error:
        'Token is empty or invalid (does not refer to valid logged in user session)',
    };
  }

  // Token is valid
  // get authUserId using token

  const authUserIdTest = getAuthUserIdUsingToken(data, token);

  const userArr = data.users;

  for (const user of userArr) {
    if (user.authUserId === authUserIdTest.authUserId) {
      const tokenArray = user.token;
      const index = tokenArray.indexOf(token);

      if (index !== -1) {
        tokenArray.splice(index, 1);
      }
    }
  }

  // save data to file
  saveDataInFile(data);

  return {};
}

export { adminAuthLogout };

/**
 * Updates the details of a user: email, firstName, lastName
 * Returns an empty object if successful
 * Returns two error types if an error occurs
 * error 400: errors relating to invalid names or emails
 * error 401: error relating to an empty or invalid token
 *
 * @param {string} token - user's current sessionId
 * @param {string} email - new email of user
 * @param {string} nameFirst - new first name of user
 * @param {string} nameLast - new last name of user
 *
 * @returns {void} - returns {} on successful password change
 * @returns {{error: string}} - on error
 */
function adminUserDetailUpdate(
  token: string,
  email: string,
  nameFirst: string,
  nameLast: string
): AdminUserDetailUpdateReturn {
  const data = retrieveDataFromFile();
  // step 1: check for valid token
  const isTokenValidTest = isTokenValid(data, token) as boolean;

  if (!isTokenValidTest) {
    return {
      detailsUpdateResponse: {
        error: 'Token is empty or invalid',
        errorCode: RESPONSE_ERROR_401,
      },
    };
  }

  // step 1a get authUserId from token

  const authUserIdTest = getAuthUserIdUsingToken(data, token)
    .authUserId as number;

  // step 2: check if email is currently used by another user (excluding the current authorised user)
  const userArr = data.users;
  for (const user of userArr) {
    if (user.authUserId !== authUserIdTest && user.email === email) {
      return {
        detailsUpdateResponse: {
          error:
            'Email is currently used by another user (excluding the current authorised user)',
          errorCode: RESPONSE_ERROR_400,
        },
      };
    }
  }

  // step 2: check if email satisifes NPM email validator package
  if (!isEmail(email)) {
    return {
      detailsUpdateResponse: {
        error:
          'Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail)',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // step 4: check if nameFirst is valid
  if (!isValidName(nameFirst)) {
    return {
      detailsUpdateResponse: {
        error: 'The first name is not valid',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // step 5: check if nameLast is valid
  if (!isValidName(nameLast)) {
    return {
      detailsUpdateResponse: {
        error: 'The last name is not valid',
        errorCode: RESPONSE_ERROR_400,
      },
    };
  }

  // step 6: all negative conditions have been passed, now update the user details

  for (const user of userArr) {
    if (user.token.includes(token)) {
      user.email = email;
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
    }
  }

  saveDataInFile(data);

  return { detailsUpdateResponse: {} };
}

export { adminUserDetailUpdate };

// Helper functions

/**
 * checks that a name is between 2-20 characters and only contains characters
 * code taken from https://bobbyhadz.com/blog/javascript-check-if-string-contains-only-letters-and-numbers
 * @param {string} name - user's name
 * @returns {boolean} true - returns true if name fits criteria
 * @returns {boolean} false - returns false if name does not fit criteria
 */
function isValidName(name: string): boolean {
  // must only include chars, spaces and hyphens
  const correctName = /^[a-zA-Z\s\-']+$/;
  if (name.length >= MIN_NAME_LENGTH && name.length <= MAX_NAME_LENGTH) {
    return correctName.test(name);
  } else {
    return false;
  }
}

/**
 * checks that password is at least 8 characters & contains at least 1 number and 1 letter
 * code taken from https://stackoverflow.com/questions/7075254/how-to-validate-a-string-which-contains-at-least-one-letter-and-one-digit-in-jav
 * @param {string} password - user's password
 * @returns {boolean} true - returns true if name fits criteria
 * @returns {boolean} false - returns false if name does not fit criteria
 */
function isValidPassword(password: string): boolean {
  // must include at least 1 number and 1 letter
  const correctPassword = /^(?=.*[0-9])(?=.*[a-zA-Z])/;
  if (password.length >= MIN_PASSWORD_LENGTH) {
    return correctPassword.test(password);
  } else {
    return false;
  }
}
